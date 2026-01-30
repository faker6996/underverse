#!/usr/bin/env bash
set -euo pipefail

########################################
# CONFIG
########################################
SRC_HOST="ai_dev"     # nguồn
DST_HOST="ai_vn_db"   # đích

PG_CONT="inf_vn_db"
PG_USER="inf_vn_db"

DBS=("inf_guardian" "inf_mes_system" "inf_nffice" "ocr_editing")

LOCAL_DUMP_DIR="$HOME/pg_migrate_dumps"
########################################

mkdir -p "$LOCAL_DUMP_DIR"

echo "=== Config ==="
echo "SRC: $SRC_HOST"
echo "DST: $DST_HOST"
echo "Container: $PG_CONT | PG_USER: $PG_USER"
echo "DBs: ${DBS[*]}"
echo "Local dumps: $LOCAL_DUMP_DIR"
echo "============="
echo

########################################
# [1/3] Dump from SOURCE -> LOCAL
########################################
echo "==> [1/3] Dump from SOURCE to LOCAL..."
for db in "${DBS[@]}"; do
  out="$LOCAL_DUMP_DIR/${db}.dump"
  echo "  - dumping $db -> $out"
  ssh "$SRC_HOST" "docker exec -i $PG_CONT pg_dump -U $PG_USER -Fc $db" > "$out"
done

echo
echo "Local check:"
ls -lh "$LOCAL_DUMP_DIR"/*.dump
file "$LOCAL_DUMP_DIR/${DBS[0]}.dump" || true

########################################
# [2/3] Copy LOCAL -> DEST
########################################
echo
echo "==> [2/3] Copy LOCAL -> DEST..."
scp "$LOCAL_DUMP_DIR"/*.dump "$DST_HOST:~/"

########################################
# [3/3] Restore on DEST
########################################
echo
echo "==> [3/3] Restore on DEST..."
ssh "$DST_HOST" bash -s <<'EOSSH'
set -euo pipefail

PG_CONT="inf_vn_db"
PG_USER="inf_vn_db"
DBS=("inf_guardian" "inf_mes_system" "inf_nffice" "ocr_editing")

psql_dest() {
  local sql="$1"
  docker exec -i "$PG_CONT" psql -U "$PG_USER" -d postgres -v ON_ERROR_STOP=1 -c "$sql"
}

drop_db_force() {
  local db="$1"
  echo "Force drop DB if exists: $db"

  # 0) Nếu DB không tồn tại thì skip (đỡ gây lỗi)
  if ! psql_dest "SELECT 1 FROM pg_database WHERE datname='${db}';" >/dev/null 2>&1; then
    echo "  - not exists, skip"
    return 0
  fi

  # 1) Chặn kết nối mới (best-effort)
  psql_dest "REVOKE CONNECT ON DATABASE \"${db}\" FROM PUBLIC;" || true

  # 2) Kill session đang dùng DB
  psql_dest "SELECT pg_terminate_backend(pid)
             FROM pg_stat_activity
             WHERE datname='${db}' AND pid <> pg_backend_pid();" || true

  # 3) DROP DATABASE KHÔNG được chạy trong DO/function => chạy trực tiếp
  # dùng quote identifier để tránh lỗi tên đặc biệt
  psql_dest "DROP DATABASE IF EXISTS \"${db}\";" || true
}

echo "Have dumps on DEST:"
ls -lh ~/*.dump

echo
echo "Drop old DBs (force)..."
for db in "${DBS[@]}"; do
  drop_db_force "$db"
done

echo
echo "Copy dumps into container..."
for db in "${DBS[@]}"; do
  docker cp ~/"${db}.dump" "$PG_CONT:/tmp/${db}.dump"
done

echo
echo "Restore..."
for db in "${DBS[@]}"; do
  docker exec -i "$PG_CONT" pg_restore -U "$PG_USER" -C -d postgres "/tmp/${db}.dump"
done

echo
echo "Verify:"
docker exec -i "$PG_CONT" psql -U "$PG_USER" -c "\l"
EOSSH

echo
echo "✅ Done."