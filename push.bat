@echo off
chcp 65001 > nul
echo ========================================================
echo       SUBIENDO CAMBIOS AUTOMATICAMENTE A GITHUB
echo ========================================================
echo.
echo [1/4] Agregando archivos al area de preparacion (git add)...
git add .
echo.
echo [2/4] Creando confirmacion local (git commit)...
git commit -m "Auto-commit: Actualizacion automatica del %%date%% a las %%time%%"
echo.
echo [3/4] Sincronizando con cambios remotos (git pull --rebase)...
git pull origin main --rebase
echo.
echo [4/4] Subiendo cambios a GitHub (git push)...
git push origin main
echo.
echo ========================================================
echo       ¡PROCESO COMPLETADO CON EXITO!
echo ========================================================
echo.
pause
