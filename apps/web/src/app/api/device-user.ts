import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Ambil data dari body
    const data = req.body;
    console.log("Request alamat device user:", data);

    // Simpan ke DB kamu di sini
    // contoh dummy:
    return res.status(200).json({ message: "Alamat berhasil diajukan" });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
