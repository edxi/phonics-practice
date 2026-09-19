import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Cloud, CloudOff, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface UserProfileMenuProps {
  onOpenAuth: () => void;
  syncStatus?: 'synced' | 'syncing' | 'offline';
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  onOpenAuth,
  syncStatus = 'synced',
}) => {
  const { user, profile, isConfigured, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-[#6d54f5] text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-purple-100"
      >
        <User className="w-3.5 h-3.5" />
        <span>登录 / 注册</span>
      </button>
    );
  }

  const initials = (profile?.displayName || profile?.email || 'U')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all active:scale-95 cursor-pointer"
      >
        {/* Avatar */}
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.displayName || 'Avatar'}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#6d54f5] to-purple-400 text-white text-[10px] font-black flex items-center justify-center">
            {initials}
          </div>
        )}

        <span className="text-xs font-bold text-slate-700 max-w-[80px] truncate">
          {profile?.displayName || profile?.email?.split('@')[0]}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-50 animate-fade-in">
          {/* User Details */}
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900 truncate">
              {profile?.displayName}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {profile?.email}
            </p>

            {/* Sync badge */}
            <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold">
              {isConfigured ? (
                syncStatus === 'syncing' ? (
                  <span className="text-amber-600 flex items-center gap-1">
                    <Cloud className="w-3 h-3 animate-pulse" />
                    云端正在同步...
                  </span>
                ) : (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Cloud className="w-3 h-3" />
                    云端已同步
                  </span>
                )
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <CloudOff className="w-3 h-3" />
                  离线模式 (未配置云端)
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-1">
            <button
              onClick={async () => {
                setIsOpen(false);
                await signOut();
              }}
              className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
