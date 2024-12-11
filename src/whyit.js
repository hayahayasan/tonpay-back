import { useNavigate } from "react-router-dom";
import { Button } from 'reactstrap';
import { supabase } from './App'; // App.jsで定義したsupabaseをインポート
//管理者キー　eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoZ2RleGp4ZXJkbGd6eWNyd2phIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDE3NTM3NSwiZXhwIjoyMDQ1NzUxMzc1fQ.xr08pUbBTcKq8q36ywQVSSJc5AuQLpKvx4Ztns0LMoE
export const Home3 = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/'); // ログアウト後、ルートページに遷移
    };

    return (
        <div>
            <h1>aaaaaaaaaaaaaaaaaaa(テスト文章)</h1>
          s
        </div>
    );
};