import { getSPMetadata } from "./spTool.service.js";
import { generateInsertUpdateSP } from "./templates/insertUpdate.template.js";

export async function generateSP(req, res) {
  try {
    const { id } = req.params;

    const metadata = await getSPMetadata(id);
    if (!metadata) {
      return res.status(404).json({ message: "No metadata found" });
    }

    const spCode = generateInsertUpdateSP(metadata);

    return res.status(200).json({
      status: 1,
      message: "SP generated successfully",
      sp: spCode,
    });
  } catch (err) {
    console.error("Controller Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
}
