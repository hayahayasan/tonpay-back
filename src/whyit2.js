import { useEffect, useState } from 'react';
import { adminSupabase } from './App';  // App.js から adminSupabase をインポート
import { Button } from 'reactstrap';

export const Home4 = () => {
    const [activeUserCount, setActiveUserCount] = useState(0);  // アクティブユーザー数
    const [totalUserCount, setTotalUserCount] = useState(0);    // 合計ユーザー数
    const [loading, setLoading] = useState(true);  // ローディング中の状態
    const [allTips, setAllTips] = useState([]);  // みんなの格言を格納する状態

    useEffect(() => {
        // 合計ユーザー数とアクティブユーザー数を取得
        const fetchUserCounts = async () => {
            try {
                // 合計ユーザー数を取得
                const { data: usersData, error: usersError } = await adminSupabase.auth.admin.listUsers();

                if (usersError) {
                    console.error('ユーザーリストの取得エラー:', usersError.message);
                    setLoading(false);  // ローディングを終了
                    return;
                }

                const users = usersData?.users || [];  // data.users が存在すればそれを使用、なければ空配列

                // 合計ユーザー数のカウント
                setTotalUserCount(users.length);

                // 現在ログインしているユーザーを取得
                const { data: sessionData, error: sessionError } = await adminSupabase.auth.getSession();

                if (sessionError) {
                    console.error('セッションの取得エラー:', sessionError.message);
                    setLoading(false);  // ローディングを終了
                    return;
                }

                if (!sessionData?.session?.user) {
                    console.log('現在ログインしているユーザーはありません');
                    setActiveUserCount(0);
                    setLoading(false);
                    return;
                }

                // 現在ログインしているユーザーをアクティブユーザーとしてカウント
                setActiveUserCount(1);  // 現在のログインユーザーのみを表示するため 1 に設定
                setLoading(false);  // ローディングを終了
            } catch (error) {
                console.error('ユーザー数の取得中にエラーが発生しました:', error.message);
                setLoading(false);  // ローディングを終了
            }
        };

        // みんなの格言を取得
        const fetchAllTips = async () => {
            try {
                const { data, error } = await adminSupabase
                    .from('kik')
                    .select('myname, mytip');  // myname と mytip を取得

                if (error) {
                    console.error('格言データの取得エラー:', error.message);
                } else {
                    setAllTips(data);  // 取得したデータを状態にセット
                }
            } catch (error) {
                console.error('格言の取得中にエラーが発生しました:', error.message);
            }
        };

        fetchUserCounts();  // ユーザー数の取得
        fetchAllTips();  // みんなの格言を取得
    }, []);  // 最初のレンダリング時にのみ実行

    return (
        <div>
            {loading ? (
                <p>読み込み中...</p>  // ローディング中の表示
            ) : (
                <>
                    <h3>合計ユーザー数：{totalUserCount}人</h3>  {/* 合計ユーザー数を表示 */}
                    <h3>アクティブユーザー数：{activeUserCount}人</h3> {/* 現在のログインユーザーを表示 */}
                    <h2>みんなの格言</h2>  {/* みんなの格言のタイトル */}

                    <ul>
                        {allTips.length > 0 ? (
                            allTips.map((tip, index) => {
                                // mynameが空白でない場合のみ処理を行う
                                if (!tip.myname) return null;  // mynameが空の場合、リストアイテムを表示しない

                                return (
                                    <li key={index}>
                                        <strong>{tip.myname}</strong>:
                                        {/* mytipが空なら代替文を表示 */}
                                        {tip.mytip ? tip.mytip : '格言をまだ投稿していません'}
                                    </li>
                                );
                            })
                        ) : (
                            <p>格言はまだありません。</p>
                        )}
                    </ul>
                </>
            )}
        </div>
    );
};
