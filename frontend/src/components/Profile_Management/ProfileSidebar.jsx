import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Briefcase, Camera } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const ProfileSidebar = ({ user, formData, setFormData }) => {
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const options = { maxSizeMB: 0.2, maxWidthOrHeight: 400, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("Failed to compress image");
    }
  };

  return (
    <Card className="col-span-1 border-border/60 shadow-sm">
      <CardContent className="pt-6 flex flex-col items-center">
        <div className="relative group mb-4">
          <Avatar className="h-28 w-28 border-4 border-slate-100 shadow-sm">
            {(formData.image || user.image) && (
              <AvatarImage src={formData.image || user.image} alt={user.name} className="object-cover" />
            )}
            <AvatarFallback className="bg-slate-200 text-slate-600 text-3xl font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Camera className="w-8 h-8 text-white" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
        <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
        <p className="text-sm font-medium text-primary mt-1 bg-primary/10 px-3 py-1 rounded-full">
          {user.role === 'ADMIN' ? 'Administrator' : 'Executive'}
        </p>

        <div className="w-full mt-8 space-y-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Briefcase className="w-4 h-4 text-slate-400" />
            <span>{user.department || 'No Department'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-success' : 'bg-danger'} ml-1`} />
            <span>{user.isActive ? 'Active Account' : 'Inactive Account'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
