import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserMe, useLogout } from '../hooks/useAuth';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useUserMe();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-[#6b1d37] font-semibold">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">فشل تحميل بيانات الملف الشخصي</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#6b1d37] text-white rounded-full">
          العودة للتسجيل
        </button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <h1 className="text-3xl font-bold text-[#6b1d37]">الملف الشخصي</h1>

      <div className="bg-gray-100 p-6 rounded-2xl text-right space-y-2">
        <p><strong className="text-[#6b1d37]">الاسم:</strong> {user?.name}</p>
        <p><strong className="text-[#6b1d37]">البريد الإلكتروني:</strong> {user?.email}</p>
      </div>

      <button
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all"
      >
        {logoutMutation.isPending ? 'جاري الخروج...' : 'تسجيل الخروج'}
      </button>
    </div>
  );
};

export default Profile;