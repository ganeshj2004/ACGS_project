@echo off
setlocal

:: Database credentials
set DB_USER=root
set DB_PASS=Ganesh@4002
set DB_HOST=localhost

:: SQL File paths
set SQL_DIR=database\sql
set SQL_FILES=01_create_db.sql 02_tables.sql 03_procedures.sql

echo Setting up GEN_CODE_DB...

for %%f in (%SQL_FILES%) do (
    echo Running %%f...
    mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% < "%SQL_DIR%\%%f"
)

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ Database setup completed successfully!
) else (
    echo.
    echo ❌ Database setup failed. Please check your MySQL credentials and script paths.
)

pause
