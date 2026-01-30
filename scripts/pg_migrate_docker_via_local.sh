#!/usr/bin/env bash
set -euo pipefail

########################################
# CONFIG
########################################
SRC_HOST="ai_dev"     # server nguồn
DST_HOST="ai_vn_db"   # server đích

PG_CONT="inf_vn_db"
PG_USER="inf_vn_db"

DBS=(
  "inf_guardian"
  "inf_mes_system"
  "inf_nffice"
  "ocr_editing"
)

LOCAL_DUMP_DIR="$HOME/pg_migrate_dumps"
########################################

mkdir -p "$LOCAL_DUMP_DIR"

echo "=============================="
echo " PostgreSQL Docker Migration"
echo "=============================="
echo "SRC        : $SRC_HOST"
echo "DST        : $DST_HOST"
echo "Container  : $PG_CONT"
echo "PG User    : $PG_USER"
echo "Databases  : ${DBS[*]}"
echo "Local dump : $LOCAL_DUMP_DIR"
echo "=============================="
echo

########################################
# [1/3] Dump SOURCE -> LOCAL
########################################
echo "==> [1/3] Dumping databases from SOURCE..."
for db in "${DBS[@]}"; do
  out="$LOCAL_DUMP_DIR/${db}.dump"
  echo "  - Dump $db"
  ssh "$SRC_HOST" \
    "docker exec -i $PG_CONT pg_dump -U $PG_USER -Fc $db" \
    > "$out"
done

echo
echo "Local dump check:"
ls -lh "$LOCAL_DUMP_DIR"/*.dump
file "$LOCAL_DUMP_DIR/${DBS[0]}.dump" || true

########################################
# [2/3] Copy LOCAL -> DEST
########################################
echo
echo "==> [2/3] Copy dumps to DEST..."
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

DBS=(
  "inf_guardian"
  "inf_mes_system"
  "inf_nffice"
  "ocr_editing"
)

echo
echo "Dumps on DEST:"
ls -lh ~/*.dump
file ~/"${DBS[0]}".dump || true

echo
echo "Terminate active connections & drop old DBs..."
for db in "${DBS[@]}"; do
  echo "---- $db ----"

  # Kill sessions using the DB
  docker exec "$PG_CONT" psql -U "$PG_USER" -d postgres -v ON_ERROR_STOP=1 -c "
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname='${db}'
      AND pid <> pg_backend_pid();
  " || true

  # Drop DB
  docker exec "$PG_CONT" psql -U "$PG_USER" -d postgres -v ON_ERROR_STOP=1 -c \
    "DROP DATABASE IF EXISTS ${db};"
done

echo
echo "Copy dumps into container..."
for db in "${DBS[@]}"; do
  docker cp ~/"${db}.dump" "$PG_CONT:/tmp/${db}.dump"
done

echo
echo "Restore databases..."
for db in "${DBS[@]}"; do
  echo "  - Restoring $db"
  docker exec "$PG_CONT" pg_restore -U "$PG_USER" -C -d postgres "/tmp/${db}.dump"
done

echo
echo "Verify database list:"
docker exec "$PG_CONT" psql -U "$PG_USER" -c "\l"
EOSSH

echo
echo "✅ MIGRATION DONE SUCCESSFULLY"
echo "If any DB reconnects too fast, stop the app and rerun."

#chmod +x pg_migrate_docker_via_local.sh
#./pg_migrate_docker_via_local.sh
