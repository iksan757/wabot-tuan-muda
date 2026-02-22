#!/bin/bash
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# File penanda rahasia
FLAG_FILE=".tuan_muda_auth"

clear
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}   TUAN MUDA BOT - ONE TIME AUTH INSTALLER   ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# CEK APAKAH SUDAH TERDAFTAR
if [ -f "$FLAG_FILE" ]; then
    echo -e "${GREEN}The password has been registered, don't enter it again!!${NC}"
    echo -e "${GREEN}Melanjutkan proses tanpa verifikasi ulang...${NC}"
else
    # MINTA PASSWORD GHAIB (TIDAK MUNCUL DI LAYAR)
    echo -n "Masukkan Kunci Akses Utama: "
    read -s input_pass
    echo ""

    # CEK PASSWORD LANGSUNG
    if [ "$input_pass" = "kansas757" ]; then
        touch "$FLAG_FILE"
        echo -e "${GREEN}✅ Akses Diterima & Terdaftar!${NC}"
    else
        echo -e "${RED}❌ AKSES DITOLAK! Kunci salah.${NC}"
        exit 1
    fi
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# PROSES INSTALASI
echo -e "Sedang menginstal mesin bot..."
pkg update -y && pkg upgrade -y
pkg install nodejs ffmpeg -y
npm install

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ INSTALL SELESAI SEMPURNA!${NC}"
echo -e "${CYAN}Ketik 'node index.js' untuk menjalankan.${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
