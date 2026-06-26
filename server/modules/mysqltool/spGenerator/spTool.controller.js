import { getSPMetadata } from "./spTool.service.js";
import { generateInsertUpdateSP } from "./templates/insertUpdate.template.js";
import { generateNodeStack } from "./templates/nodeGenerator.template.js";
import { generateReactStack } from "./templates/reactGenerator.template.js";
import { generatePythonStack } from "./templates/pythonGenerator.template.js";
import { generateJavaStack } from "./templates/javaGenerator.template.js";
import { generatePhpStack } from "./templates/phpGenerator.template.js";

export async function generateSP(req, res) {
  try {
    const { id } = req.params;

    const metadata = await getSPMetadata(id);
    if (!metadata) {
      return res.status(404).json({ message: "No metadata found" });
    }

    const { type } = req.query; // 'sql', 'node', 'react'

    let generatedCode = "";
    if (type === "node") {
      generatedCode = generateNodeStack(metadata);
    } else if (type === "react") {
      generatedCode = generateReactStack(metadata);
    } else if (type === "python") {
      generatedCode = generatePythonStack(metadata);
    } else if (type === "java") {
      generatedCode = generateJavaStack(metadata);
    } else if (type === "php") {
      generatedCode = generatePhpStack(metadata);
    } else {
      generatedCode = generateInsertUpdateSP(metadata);
    }

    return res.status(200).json({
      status: 1,
      message: `${type || 'sql'} generated successfully`,
      sp: generatedCode,
    });
  } catch (err) {
    console.error("Controller Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
}
