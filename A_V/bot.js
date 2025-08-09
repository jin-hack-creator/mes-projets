const { useMultiFileAuthState, makeWASocket } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const pino = require('pino')

// Configuration
const logger = pino({ level: 'silent' })
const PLAYERS = {
  ELOIM: "Eloïm",
  EMMANUEL: "Emmanuel"
}

// 50 questions osées pour le couple
const veritesCouple = [
  // Niveau 1 - Confidences douces
  "Quel est ton souvenir préféré de notre première fois ensemble ?",
  "Qu'est-ce qui t'a immédiatement attiré chez moi physiquement ?",
  "À quel moment m'as-tu trouvé(e) le plus sexy cette semaine ?",
  
  // Niveau 2 - Fantasmes légers
  "Quelle partie de mon corps aimes-tu le plus embrasser ?",
  "As-tu déjà fantasmé sur moi dans un lieu public ?",
  "Si on partait en week-end romantique, où voudrais-tu m'emmener ?",
  
  // Niveau 3 - Confessions intimes
  "Quelle position nous n'avons pas encore essayée mais que tu aimerais tester ?",
  "As-tu déjà simulé un orgasme avec moi ? Si oui, pourquoi ?",
  "Qu'est-ce que je fais qui te fait jouir le plus vite ?",
  
  // Niveau 4 - Jeux érotiques
  "Aimerais-tu qu'on filme nos ébats pour regarder ensemble ?",
  "Quel rôle voudrais-tu que je joue lors d'un jeu de rôle coquin ?",
  "Serais-tu partant(e) pour une soirée avec un autre couple ?",
  
  // Niveau 5 - Fantasmes profonds
  "Si je te donnais 24h pour me faire tout ce que tu veux, par quoi commencerais-tu ?",
  "Quel endroit insolite aimerais-tu qu'on fasse l'amour ?",
  "Quelle est la chose la plus sale que tu aies envie de me faire ?",
  
  // Suite des questions...
  "As-tu déjà pensé à quelqu'un d'autre en faisant l'amour avec moi ?",
  "Aimerais-tu me voir utiliser un sextoy sur moi-même ?",
  "Quel est ton fantasme que tu n'oses pas me révéler ?",
  "Si je te disais de choisir n'importe qui pour un plan à 3, qui choisirais-tu ?",
  "Quelle est la chose la plus osée que tu ferais si je te le demandais ?",
  "Préfères-tu quand je domine ou quand je me soumets ?",
  "As-tu déjà regardé du porno en pensant à nous ?",
  "Que penses-tu de ma façon d'embrasser ?",
  "Quel vêtement de moi t'excite le plus ?",
  "Aimerais-tu qu'on s'envoie des nudes au travail ?",
  "Qu'est-ce que je pourrais faire pour te surprendre sexuellement ?",
  "As-tu déjà fait l'amour ailleurs que dans une chambre avec moi ?",
  "Que ressens-tu quand je te mords doucement ?",
  "Aimerais-tu que je sois plus verbal(e) pendant l'amour ?",
  "Quel est ton souvenir le plus hot de nous deux ?",
  "Comment aimes-tu qu'on termine nos ébats ?",
  "As-tu déjà regretté un de nos rapports ?",
  "Que penses-tu de mes gémissements ?",
  "Quelle partie de toi aimes-tu que je caresse le plus ?",
  "Aimerais-tu qu'on prenne plus de temps pour les préliminaires ?",
  "Qu'est-ce qui te fait le plus envie quand tu me vois nue/nu ?",
  "As-tu déjà pensé à moi en te masturbant ?",
  "Que dirais-tu de passer une nuit entière à faire l'amour ?",
  "Quelle est ta caresse préférée que je te fais ?",
  "Aimerais-tu me voir porter de la lingerie sexy ? Quel modèle ?",
  "Quel compliment sexuel m'as-tu jamais dit ?",
  "Que penses-tu de mes performances au lit ? Sois honnête !",
  "Aimerais-tu essayer le sexe anal avec moi ?",
  "As-tu déjà eu un orgasme particulièrement intense avec moi ?",
  "Que ressens-tu quand je te chevauche ?",
  "Aimerais-tu que je sois plus agressif(ve) au lit ?",
  "Quel est ton moment préféré quand on fait l'amour ?",
  "As-tu déjà eu envie de me réveiller pour faire l'amour ?",
  "Que penses-tu de mon goût ?",
  "Aimerais-tu qu'on fasse l'amour sous la douche plus souvent ?",
  "Qu'est-ce qui te rend fou/folle quand je te fais une fellation/cunnilingus ?",
  "As-tu déjà joui sans qu'on te touche ?",
  "Que dirais-tu d'une semaine sans sexe puis une nuit marathon ?"
]

const actionsCouple = {
  [PLAYERS.ELOIM]: [
    "Envoie un message vocal à Emmanuel en murmurant ce que tu voudrais lui faire",
    "Fais une photo de toi avec un regard sexy et envoie-la",
    "Décris ton fantasme avec Emmanuel en moins de 20 mots",
    "Envoie un emoji qui représente ce que tu veux lui faire maintenant",
    "Chuchote quelque chose d'érotique à l'oreille d'Emmanuel"
  ],
  [PLAYERS.EMMANUEL]: [
    "Envoie un message à Eloïm disant ce que tu veux lui faire ce soir",
    "Fais une vidéo de toi en train de souffler un baiser coquin",
    "Choisis un vêtement sexy que tu aimerais voir sur Eloïm",
    "Décris en détail comment tu veux toucher Eloïm ce soir",
    "Envoie une photo de l'endroit où tu voudrais faire l'amour avec Eloïm"
  ]
}

let currentPlayer = PLAYERS.ELOIM
let gameActive = false
let currentIntensity = 1
let connectedUser = null

async function runBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  
  const sock = makeWASocket({
    auth: state,
    logger: logger,
    browser: ['Eloïm & Emmanuel AV Game', 'Desktop', '1.0.0']
  })

  // Gestion améliorée du QR Code
  sock.ev.on('connection.update', async (update) => {
    const { connection, qr } = update
    
    if (qr) {
      console.log('Scannez ce QR Code avec WhatsApp pour connecter le bot:')
      qrcode.generate(qr, { small: true })
    }
    
    if (connection === 'close') {
      console.log('Connexion perdue, reconnexion...')
      setTimeout(runBot, 5000)
    } else if (connection === 'open') {
      console.log('Connecté avec succès à WhatsApp!')
      connectedUser = sock.user?.id
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const text = msg.message.conversation?.toLowerCase() || ''
    const sender = msg.key.remoteJid
    connectedUser = sender

    try {
      if (text === '!av') {
        gameActive = true
        currentPlayer = PLAYERS.ELOIM
        currentIntensity = 1
        await sock.sendMessage(sender, {
          text: `🔥 *Action ou Vérité - Eloïm & Emmanuel* 🔥\n\nNiveau ${currentIntensity}/5\n\nCommandes:\n!v - Vérité\n!a - Action\n!+ - Augmenter l'intensité\n!- - Réduire l'intensité\n!changer - Changer de joueur\n!stop - Arrêter`
        })
      }
      else if (gameActive) {
        if (text === '!v') {
          const filteredVerites = veritesCouple.filter((_, index) => index < 15 * currentIntensity)
          const question = filteredVerites[Math.floor(Math.random() * filteredVerites.length)]
          await sock.sendMessage(sender, {
            text: `💋 *Vérité Niveau ${currentIntensity} pour ${currentPlayer}:*\n\n${question}\n\nRéponds honnêtement mon amour...`
          })
        }
        else if (text === '!a') {
          const actions = actionsCouple[currentPlayer]
          const action = actions[Math.floor(Math.random() * actions.length)]
          await sock.sendMessage(sender, {
            text: `🎯 *Action pour ${currentPlayer}:*\n\n${action}\n\nÀ toi de jouer mon chéri...`
          })
        }
        else if (text === '!+') {
          currentIntensity = Math.min(5, currentIntensity + 1)
          await sock.sendMessage(sender, {
            text: `⬆️ *Niveau ${currentIntensity} activé!* Les questions seront plus osées...`
          })
        }
        else if (text === '!-') {
          currentIntensity = Math.max(1, currentIntensity - 1)
          await sock.sendMessage(sender, {
            text: `⬇️ *Niveau ${currentIntensity} activé!* On ralentit un peu...`
          })
        }
        else if (text === '!changer') {
          currentPlayer = currentPlayer === PLAYERS.ELOIM ? PLAYERS.EMMANUEL : PLAYERS.ELOIM
          await sock.sendMessage(sender, {
            text: `🔄 C'est maintenant au tour de *${currentPlayer}* !`
          })
        }
        else if (text === '!stop') {
          gameActive = false
          await sock.sendMessage(sender, {
            text: `🛑 *Jeu terminé* 🛑\n\nMerci d'avoir joué! Envoyez "!av" pour recommencer.\n\nJe vous aime mes amours ❤️`
          })
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  })
}

runBot().catch(err => console.log("Erreur:", err))