"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Edit,
  Camera,
  Package,
  Heart
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileContainerProps {
  className?: string;
}

export default function ProfileContainer({ className }: ProfileContainerProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "favorites" | "addresses">("profile");
  const [isEditing, setIsEditing] = useState(false);

  const mockOrders = [
    {
      id: 1,
      orderNumber: "DH001",
      date: "2024-01-15",
      total: 350000,
      status: "delivered",
      items: 2
    },
    {
      id: 2,
      orderNumber: "DH002",
      date: "2024-01-10",
      total: 800000,
      status: "processing",
      items: 1
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="success" size="sm">Đã giao</Badge>;
      case "processing":
        return <Badge variant="warning" size="sm">Đang xử lý</Badge>;
      case "cancelled":
        return <Badge variant="danger" size="sm">Đã hủy</Badge>;
      default:
        return <Badge variant="outline" size="sm">Chờ xác nhận</Badge>;
    }
  };

  const tabs = [
    { id: "profile", label: "Thông tin cá nhân", icon: UserIcon },
    { id: "orders", label: "Đơn hàng", icon: Package },
    { id: "favorites", label: "Yêu thích", icon: Heart },
    { id: "addresses", label: "Địa chỉ", icon: MapPin }
  ];

  return (
    <div className={cn("container mx-auto px-6 py-8", className)}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Tài khoản của tôi
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý thông tin cá nhân và đơn hàng
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="relative mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full"
                    title="Thay đổi ảnh"
                  >
                    <Camera className="w-3 h-3" />
                  </Button>
                </div>
                <h3 className="font-semibold text-foreground mt-3">
                  {user?.name || "Người dùng"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {user?.email || "email@example.com"}
                </p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Thông tin cá nhân
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    icon={Edit}
                  >
                    {isEditing ? "Hủy" : "Chỉnh sửa"}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Họ và tên
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {user?.name || "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {user?.email || "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Số điện thoại
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {user?.phone_number || "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Địa chỉ
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {user?.address || "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Ngày tham gia
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {user?.created_at ? formatDate(user.created_at) : "Chưa rõ"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Trạng thái tài khoản
                      </label>
                      <div className="mt-1">
                        <Badge variant="success" size="sm">
                          Đã xác thực
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex gap-3">
                      <Button variant="primary">
                        Lưu thay đổi
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {activeTab === "orders" && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Lịch sử đơn hàng
                </h2>

                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <Card key={order.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">
                              Đơn hàng #{order.orderNumber}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.date)} • {order.items} sản phẩm
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-3 mb-1">
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "favorites" && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Sản phẩm yêu thích
                </h2>
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Bạn chưa có sản phẩm yêu thích nào
                  </p>
                  <Button variant="outline" className="mt-4">
                    Khám phá sản phẩm
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === "addresses" && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Sổ địa chỉ
                  </h2>
                  <Button variant="primary">
                    Thêm địa chỉ mới
                  </Button>
                </div>

                <div className="space-y-4">
                  <Card className="p-4 border-l-4 border-l-primary">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-foreground">
                            {user?.name || "Địa chỉ mặc định"}
                          </h3>
                          <Badge variant="primary" size="sm">Mặc định</Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {user?.address || "Chưa có địa chỉ"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {user?.phone_number || "Chưa có số điện thoại"}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
