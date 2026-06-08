@echo off
:: Configuración de caracteres en español
chcp 65001 > nul

echo ========================================================
echo       SUBIENDO CAMBIOS AUTOMÁTICAMENTE A GITHUB
echo ========================================================
echo.

echo [1/4] Agregando archivos al área de preparación (git add)...
git add .
echo.

echo [2/4] Creando confirmación local (git commit)...
git commit -m "Auto-commit: Actualización automática del %date% a las %time%"
echo.

echo [3/4] Sincronizando con cambios remotos (git pull --rebase)...
git pull origin main --rebase
echo.

echo [4/4] Subiendo cambios a GitHub (git push)...
git push origin main
echo.

echo ========================================================
echo       ¡PROCESO COMPLETADO CON ÉXITO!
echo ========================================================
echo.
pause
