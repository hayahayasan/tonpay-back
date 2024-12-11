import { Home } from "./logout";
import { Home2 } from "./nullx";
import { Home3 } from "./whyit";
import { Home4 } from "./whyit2";
import './index.css';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Route, Routes, Link, useNavigate } from "react-router-dom";
import { Button } from 'reactstrap';

// Supabase クライアントの設定
export const adminSupabase = createClient(
    'https://ehgdexjxerdlgzycrwja.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoZ2RleGp4ZXJkbGd6eWNyd2phIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTEyOTczNCwiZXhwIjoyMDQ2NzA1NzM0fQ.DGBcWAACp7x5kGZL7ssWKbm46rWf-Rwq6MqyzfRmHZg' // 管理者キーを入力
);

export const supabase = createClient(
    'https://ehgdexjxerdlgzycrwja.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoZ2RleGp4ZXJkbGd6eWNyd2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExMjk3MzQsImV4cCI6MjA0NjcwNTczNH0._CMyfHd5oXR9QaXat2AniKT1rlKpsc4mslZNMtdKzJU' // クライアントキーを入力
);

export default function App() {
    const [session, setSession] = useState(null);
    const [userName, setUserName] = useState('');
    const [showMessage, setShowMessage] = useState(null);
    const [showNameForm, setShowNameForm] = useState(false);
    const [myName, setMyName] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [myTip, setMyTip] = useState(''); // 格言用の状態
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                checkUserInKikTable(session.user.id);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                checkUserInKikTable(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkUserInKikTable = async (userId) => {
        const { data, error } = await supabase
            .from('kik')
            .select('id, myname, mytip, user_id')
            .eq('user_id', userId);

        if (error) {
            console.error("Error fetching user data:", error.message);
        } else {
            if (data.length > 1) {
                const rowsToDelete = data.slice(1);
                for (const row of rowsToDelete) {
                    const { error: deleteError } = await supabase
                        .from('kik')
                        .delete()
                        .eq('id', row.id);
                    if (deleteError) {
                        console.error("Error deleting extra row:", deleteError.message);
                    }
                }
            }
            if (data.length === 0) {
                const { error: insertError } = await supabase
                    .from('kik')
                    .insert([{ user_id: userId }]);

                if (insertError) {
                    console.error("Error inserting user data:", insertError.message);
                }
                setShowNameForm(true);
            } else {
                const userRow = data[0];
                setMyName(userRow.myname);
                setMyTip(userRow.mytip || '');
                if (!userRow.myname) {
                    setShowNameForm(true);
                }
            }
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setShowMessage("ログアウトが完了しました。<br/>3秒後にトップページに戻ります。");
        setTimeout(() => {
            setShowMessage(null);
            navigate('/');
        }, 3000);
    };

    const handleRegisterUserName = async () => {
        if (!userName) {
            alert("ユーザー名を入力してください");
            return;
        }

        if (userName.length > 20) {
            alert("ユーザー名は20文字以内で入力してください");
            return;
        }

        const user = session?.user;

        if (user) {
            const { data, error } = await supabase
                .from('kik')
                .select('id, myname, user_id')
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error("Error checking user data:", error.message);
            } else {
                if (data) {
                    const { error: updateError } = await supabase
                        .from('kik')
                        .update({ myname: userName })
                        .eq('id', data.id);

                    if (updateError) {
                        console.error("Error updating myname:", updateError.message);
                    } else {
                        setMyName(userName);
                        setShowNameForm(false);
                        window.location.reload();
                    }
                }
            }
        }
    };

    const handleSaveTip = async () => {
        const user = session?.user;

        if (user) {
            const { data, error } = await supabase
                .from('kik')
                .select('id, mytip')
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error("Error saving tip:", error.message);
            } else {
                const { error: updateError } = await supabase
                    .from('kik')
                    .update({ mytip: myTip })
                    .eq('id', data.id);

                if (updateError) {
                    console.error("Error updating mytip:", updateError.message);
                } else {
                    setShowMessage("格言を保存しました。<br/>3秒後にトップページに戻ります。");
                    setTimeout(() => {
                        setShowMessage(null);
                        navigate('/');
                    }, 3000);
                }
            }
        }
    };

    const handleDeleteAccount = async (confirmation) => {
        if (confirmation === 'NO') {
            setShowDeleteConfirm(false);
            return;
        }

        if (confirmation === 'YES') {
            const user = session?.user;

            if (user) {
                // ユーザーのデータを取得
                const { data, error } = await supabase
                    .from('kik')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (error) {
                    console.error("Error fetching user data for deletion:", error.message);
                } else {
                    if (data) {
                        // ユーザー情報の削除
                        const { error: deleteKikError } = await supabase
                            .from('kik')
                            .delete()
                            .eq('id', data.id);

                        if (deleteKikError) {
                            console.error("Error deleting user from kik:", deleteKikError.message);
                        }

                        // ユーザーアカウントの削除（管理者権限）
                        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);
                        if (deleteError) {
                            console.error('Error deleting user account:', deleteError.message);
                            return;
                        }

                        // ユーザーアカウント削除により、全てのセッションが無効になる
                        console.log('User account and all associated sessions have been revoked');
                    }
                }
            }

            // ログアウト処理
            await supabase.auth.signOut();

            setShowMessage("アカウントの削除が完了しました。<br/>3秒後にログイン画面に戻ります。");
            setTimeout(() => {
                setShowMessage(null);
                navigate('/');
            }, 3000);
        }
    };


    if (showMessage) {
        return (
            <div
                dangerouslySetInnerHTML={{
                    __html: showMessage,
                }}
            ></div>
        );
    }

    if (!session) {
        return (
            <div><Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'github']}
                redirectTo="http://localhost:3000" // リダイレクトURLを明示的に設定
            />
                <h1>ようこそ、格言メーカーへ</h1>
                <p>・格言メーカーは大人の事情（お金の問題）でGoogleなどでのログインしか実装していません。</p>
                <p>・コードのほとんどはChatgptで作って高速開発ができました。</p>
                <p>・開発サーバー・Supabase</p>
            </div>


        );
    } else {
        return (
            <div>
                <Link to="/logout">Home</Link>
                <br />
                <Link to="/can">Why It?</Link>
                <br />

                {showNameForm && (
                    <div>
                        <h1>ユーザー名を登録してください</h1>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            maxLength={20}
                        />
                        <button onClick={handleRegisterUserName}>登録</button>
                        <button onClick={() => setShowNameForm(false)}>戻る</button>
                    </div>
                )}

                {showDeleteConfirm && (
                    <div>
                        <h1>アカウントを削除しますか？</h1>
                        <Button color="danger" onClick={() => handleDeleteAccount('YES')}>YES</Button>
                        <Button color="secondary" onClick={() => handleDeleteAccount('NO')}>NO</Button>
                    </div>
                )}

                {!showNameForm && !showDeleteConfirm && myName && (
                    <div>
                        <h1>ようこそ！{myName}さん</h1>
                        <Button color="danger" onClick={() => setShowDeleteConfirm(true)}>アカウント削除</Button>
                        <br /><Button color="primary" onClick={handleLogout}>ログアウトする</Button>

                        <br />
                        <Button color="secondary" onClick={() => setShowNameForm(true)}>ユーザー名変更</Button>

                        <div>
                            <h2>格言を残そう！</h2>
                            <textarea
                                value={myTip}
                                onChange={(e) => setMyTip(e.target.value)}
                                maxLength={2000}
                            />
                            <Button color="primary" onClick={handleSaveTip}>保存</Button>
                        </div>
                    </div>
                )}

                <Routes>
                    <Route path='/logout' element={<Home />} />
                    <Route path='/*' element={<Home2 />} />
                    <Route path='/can' element={<Home3 />} />
                    <Route path='/' element={<Home4 />} />
                </Routes>
            </div>
        );
    }
}