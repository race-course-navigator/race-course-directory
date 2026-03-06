@echo off
chcp 65001 >nul
echo -----------------------------------------
echo レース情報をネットから取得し、最新データに更新しています。
echo ※しばらくお待ちください（完了まで数分かかる場合があります）
echo -----------------------------------------
python fetch_races.py
python convert_data.py
echo.
echo 更新が完了しました。最新のレース一覧がアプリに反映されます。
pause
