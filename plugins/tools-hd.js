import axios from 'axios';
import FormData from 'form-data';

// FUNCION PARA REACCIONES COMPATIBLE
const react = async (conn, m, text) => {
  try { await conn.sendMessage(m.chat, { react: { text: text, key: m.key } }) } catch {}
}

let handler = async (m, { conn, prefix, command }) => {
  try {
    let q = m.quoted? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime) return m.reply(`📸 Responde a una imagen con el comando *${prefix}${command}*`);
    if (!mime.startsWith('image')) return m.reply(`⚠️ Solo se admiten imágenes.`);

    await react(conn, m, "⚡");
    await m.reply('⏳ Mejorando calidad de la imagen...')

    const media = await q.download();

    // Procesamiento con IA
    const enhancedBuffer = await ihancer(media, { method: 1, size: 'high' });

    const caption = `╭─「 MEJORAR IMAGEN CON IA 」
│
│ ⚙️ PROCESO: iHancer AI
│ 🔝 CALIDAD: Alta
│ 📦 RESULTADO: Imagen HD
│
╰───────────────────────
Listo, tu imagen fue mejorada.`

    await conn.sendMessage(m.chat, {
      image: enhancedBuffer,
      caption
    }, { quoted: m });

    await react(conn, m, "✅");

  } catch (e) {
    console.error(e);
    await react(conn, m, "❌");
    await m.reply(`❌ Ocurrió un error al procesar la imagen.`);
  }
};

async function ihancer(buffer, { method = 1, size = 'low' } = {}) {
    const _size = ['low', 'medium', 'high']
    if (!buffer ||!Buffer.isBuffer(buffer)) throw new Error('Se requiere una imagen')
    if (method < 1 || method > 4) throw new Error('Métodos disponibles: 1, 2, 3, 4')
    if (!_size.includes(size)) throw new Error(`Calidades disponibles: ${_size.join(', ')}`)

    const form = new FormData()
    form.append('method', method.toString())
    form.append('is_pro_version', 'false')
    form.append('is_enhancing_more', 'false')
    form.append('max_image_size', size)
    form.append('file', buffer, `file_${Date.now()}.jpg`)

    const { data } = await axios.post('https://ihancer.com/api/enhance', form, {
        headers: {
            ...form.getHeaders(),
            'accept-encoding': 'gzip',
            'host': 'ihancer.com',
            'user-agent': 'Dart/3.5 (dart:io)'
        },
        responseType: 'arraybuffer'
    })
    return Buffer.from(data)
}

handler.help = ['hd', 'upscale', 'enhance', 'remini'];
handler.tags = ['ai', 'imagen'];
handler.command = ['hd', 'upscale', 'enhance', 'remini'];
handler.limit = true;

export default handler;