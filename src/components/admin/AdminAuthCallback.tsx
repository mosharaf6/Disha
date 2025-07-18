import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AdminAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Admin auth callback error:', error);
          navigate('/admin/login');
          return;
        }

        if (data.session?.user) {
          // Check if user is an admin
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', data.session.user.id)
            .eq('is_active', true)
            .single();

          if (adminUser) {
            navigate('/admin');
          } else {
            navigate('/admin/login?error=unauthorized');
          }
        } else {
          navigate('/admin/login');
        }
      } catch (error) {
        console.error('Admin auth callback error:', error);
        navigate('/admin/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying admin access...</p>
      </div>
    </div>
  );
};

export default AdminAuthCallback;