// [File: /api/script.js]
// Ini adalah kode Node.js untuk Serverless Function di Vercel

export default async function handler(request, response) {
    // 1. Ambil URL rahasia dari Vercel Environment Variables
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    if (!GOOGLE_SCRIPT_URL) {
        return response.status(500).json({
            status: "error",
            message: "Server configuration error: Missing GOOGLE_SCRIPT_URL."
        });
    }

    try {
        let googleResponse;

        // 2. Cek apakah ini request GET atau POST
        if (request.method === "GET") {
            // Jika GET: Teruskan semua query params (seperti ?action=getUjianGuru&email=...)
            const fullUrl = `${GOOGLE_SCRIPT_URL}?${request.url.split('?')[1] || ''}`;

            googleResponse = await fetch(fullUrl, {
                method: "GET",
                redirect: "follow",
            });

        } else if (request.method === "POST") {
            // Jika POST: Teruskan body
            googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                redirect: "follow",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(request.body), // request.body sudah di-parse oleh Vercel
            });

        } else {
            return response.status(405).json({ message: "Method Not Allowed" });
        }

        // 3. Ambil data dari Google (sebagai teks)
        const dataText = await googleResponse.text();

        // 4. Kirim kembali ke browser Anda (index.html)
        // Kita set header agar browser tahu ini adalah JSON
        response.setHeader("Content-Type", "application/json");
        response.status(200).send(dataText); // Kirim sebagai teks mentah

    } catch (error) {
        response.status(500).json({
            status: "error",
            message: `Proxy Error: ${error.message}`
        });
    }
}