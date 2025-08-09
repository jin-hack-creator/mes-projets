const { useMultiFileAuthState, makeWASocket, delay } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const pino = require('pino')
const axios = require('axios')
const fs = require('fs')

// Configuration
const logger = pino({ level: 'silent' })
const TELEGRAM_TOKEN = '7255525909:AAHrp1dDCKbOSoiljFcF1fl4PQ9Tm2-E1Xo' // Remplacez par votre token

// Jeu Action/Vérité
const gameState = {
    players: [],
    currentPlayerIndex: 0,
    gameActive: false,
    groupJid: null
}

const verites = [
    "Quel est ton fantasme le plus fou?",
    "As-tu déjà trompé ton partenaire?",
    "Qu'est-ce qui t'excite le plus chez ton partenaire?"
]

const actions = [
    "Fais un massage de 2 minutes au joueur de ton choix",
    "Envoie un message vocal érotique",
    "Embrasse le joueur à ta gauche"
]

// Fonction pour télécharger les stickers Telegram
async function downloadTelegramSticker(url, sock, sender) {
    try {
        if (!url.includes('addstickers')) {
            return await sock.sendMessage(sender, {
                text: "❌ URL invalide\nFormat attendu : https://t.me/addstickers/NomPack"
            })
        }

        const packName = url.split('/addstickers/')[1]
        const { data } = await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getStickerSet?name=${packName}`)

        if (data.result.is_animated) {
            return await sock.sendMessage(sender, {
                text: "⚠️ Les stickers animés ne sont pas supportés"
            })
        }

        await sock.sendMessage(sender, {
            text: `📦 Pack: ${packName}\n✨ Stickers: ${data.result.stickers.length}\nTéléchargement en cours...`
        })

        // Télécharge le premier sticker du pack
        const sticker = data.result.stickers[0]
        const fileInfo = await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${sticker.file_id}`)
        const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${fileInfo.data.result.file_path}`

        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' })
        await sock.sendMessage(sender, {
            sticker: Buffer.from(response.data),
            mimetype: 'image/webp'
        })

    } catch (error) {
        console.error('Erreur TGS:', error)
        await sock.sendMessage(sender, {
            text: `❌ Erreur: ${error.response?.data?.description || error.message}`
        })
    }
}

// Fonction pour gérer le tour suivant dans le jeu
async function nextTurn(sock) {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length
    const nextPlayer = gameState.players[gameState.currentPlayerIndex]
    
    await sock.sendMessage(gameState.groupJid, {
        text: `🔄 C'est maintenant à ${nextPlayer.name} de jouer!\n\n` +
              `Envoyez "!v" pour Vérité ou "!a" pour Action`
    })
}

async function runBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')
    
    const sock = makeWASocket({
        auth: state,
        logger: logger
    })

    // Gestion connexion
    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update
        if (qr) {
            console.log('\n=== SCANNEZ CE QR CODE AVEC WHATSAPP ===')
            console.log('1. Ouvrez WhatsApp sur votre téléphone')
            console.log('2. Allez dans Paramètres > Appareils liés')
            console.log('3. Appuyez sur "Lier un appareil"\n')
            qrcode.generate(qr, { small: true }, qr => {
                console.log(qr)
            })
        }
        if (connection === 'open') {
            console.log('\n✅ Bot connecté avec succès!')
        }
    })

    sock.ev.on('creds.update', saveCreds)

    // Gestion messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message) return

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        const sender = msg.key.remoteJid
        const isGroup = msg.key.remoteJid.endsWith('@g.us')

        try {
            // Commande .tgs
            if (text.startsWith('.tgs')) {
                const url = text.split(' ')[1]
                return await downloadTelegramSticker(url, sock, sender)
            }

            // Jeu Action/Vérité
            if (text.toLowerCase() === '!av') {
                if (!isGroup) {
                    await sock.sendMessage(sender, { text: "⚠️ Ce jeu doit être lancé dans un groupe !" })
                    return
                }

                gameState.groupJid = sender
                gameState.gameActive = true
                gameState.players = []
                gameState.currentPlayerIndex = 0
                
                await sock.sendMessage(sender, { 
                    text: "🌟 *Action ou Vérité - Mode Groupe* 🌟\n\n" +
                          "Pour jouer, chaque participant doit envoyer:\n" +
                          "!join [prenom]\n\n" +
                          "Quand tous les joueurs sont inscrits, envoyez !start pour commencer."
                })
            }

            if (text.toLowerCase().startsWith('!join') && gameState.gameActive && sender === gameState.groupJid) {
                const playerName = text.split(' ')[1] || `Joueur${gameState.players.length + 1}`
                if (!gameState.players.some(p => p.id === msg.key.participant || p.id === sender)) {
                    const playerId = msg.key.participant || sender
                    gameState.players.push({ id: playerId, name: playerName })
                    await sock.sendMessage(sender, { 
                        text: `✅ ${playerName} a rejoint le jeu! (${gameState.players.length} joueurs)`
                    })
                }
            }

            if (text.toLowerCase() === '!start' && gameState.gameActive && sender === gameState.groupJid) {
                if (gameState.players.length < 2) {
                    await sock.sendMessage(sender, { 
                        text: "⚠️ Il faut au moins 2 joueurs pour commencer!"
                    })
                    return
                }

                await sock.sendMessage(sender, {
                    text: `🎮 Début du jeu avec ${gameState.players.length} joueurs!\n\n` +
                          `Premier joueur: ${gameState.players[0].name}\n` +
                          `Envoyez "!v" pour Vérité ou "!a" pour Action`
                })
            }

            if ((text.toLowerCase() === '!v' || text.toLowerCase() === '!a') && gameState.gameActive) {
                const currentPlayer = gameState.players[gameState.currentPlayerIndex]
                const playerId = msg.key.participant || sender
                
                if (playerId !== currentPlayer.id) {
                    await sock.sendMessage(sender, { 
                        text: "⚠️ Ce n'est pas ton tour !"
                    })
                    return
                }

                if (text.toLowerCase() === '!v') {
                    const question = verites[Math.floor(Math.random() * verites.length)]
                    await sock.sendMessage(gameState.groupJid, {
                        text: `💬 ${currentPlayer.name}, Vérité:\n\n${question}`
                    })
                } else {
                    const action = actions[Math.floor(Math.random() * actions.length)]
                    await sock.sendMessage(gameState.groupJid, {
                        text: `🎯 ${currentPlayer.name}, Action:\n\n${action}`
                    })
                }

                await delay(2000) // Petite pause
                await nextTurn(sock)
            }

        } catch (error) {
            console.error('Erreur:', error)
            await sock.sendMessage(sender, {
                text: "❌ Une erreur s'est produite, veuillez réessayer"
            })
        }
    })
}

runBot().catch(err => console.log("Erreur initiale:", err))