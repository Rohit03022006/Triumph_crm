import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import imageCompression from "browser-image-compression";
import { Camera, Users, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserFormDialog = ({
  isOpen,
  setIsOpen,
  onSubmit,
  data,
  setData,
  title,
  isPending,
  isEdit,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 400,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setData({ ...data, image: reader.result });
      };
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("Failed to compress image");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...data });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-175 p-0 overflow-hidden bg-slate-50">
        <div className="flex flex-col md:flex-row max-h-[85vh]">
          {/* Form Side */}
          <div className="flex-1 p-6 bg-white overflow-y-auto">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <p className="text-lg text-slate-700 ">
                  {isEdit
                    ? "Edit team member and assign permissions"
                    : "Add a new team member"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image Upload */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative group cursor-pointer">
                  <Avatar className="h-16 w-16 border-2 border-border/50 shadow-sm group-hover:opacity-80 transition">
                    {data.image && (
                      <AvatarImage
                        src={data.image}
                        alt="Profile"
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-xl">
                      {data.name ? data.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="photo-upload"
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">Profile Photo</p>
                  <p className="text-muted-foreground text-xs">
                    JPG, PNG (Auto-compressed to &lt; 200KB)
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-4">
                  Personal Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">
                      Full Name <span className="text-danger">*</span>
                    </Label>
                    <Input
                      value={data.name || ""}
                      onChange={(e) =>
                        setData({ ...data, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">
                      Email <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="email"
                      value={data.email || ""}
                      onChange={(e) =>
                        setData({ ...data, email: e.target.value })
                      }
                      required
                      disabled={isEdit}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">
                      Phone <span className="text-danger">*</span>
                    </Label>
                    <Input
                      value={data.phone || ""}
                      onChange={(e) =>
                        setData({ ...data, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Address</Label>
                    <Input
                      value={data.address || ""}
                      onChange={(e) =>
                        setData({ ...data, address: e.target.value })
                      }
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              {isEdit ? (
                <div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-slate-500">
                        Reset Password
                      </Label>
                      <span className="text-[11px] text-muted-foreground">
                        Leave blank to keep current password
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password (min. 8 characters)"
                        value={data.password || ""}
                        onChange={(e) =>
                          setData({ ...data, password: e.target.value })
                        }
                        minLength={8}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">
                      Temporary Password <span className="text-danger">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={data.password || ""}
                        onChange={(e) =>
                          setData({ ...data, password: e.target.value })
                        }
                        required
                        minLength={8}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-4">
                  Professional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Role <span className="text-danger">*</span></Label>
                    <Select value={data.role} onValueChange={v => setData({...data, role: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXECUTIVE">Executive</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Account Status <span className="text-danger">*</span></Label>
                    <Select value={data.isActive ? "ACTIVE" : "INACTIVE"} onValueChange={v => setData({...data, isActive: v === "ACTIVE"})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Verification <span className="text-danger">*</span></Label>
                    <Select value={data.emailVerified ? "VERIFIED" : "PENDING"} onValueChange={v => setData({...data, emailVerified: v === "VERIFIED"})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VERIFIED">Verified</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-primary hover:bg-brand-dark text-primary-foreground rounded-lg px-8"
                >
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
