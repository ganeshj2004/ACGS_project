export function generatePhpStack(meta) {
  const parent = meta.parent || {};
  const table = parent.table || "YOUR_TABLE";

  return `
<?php
/**
 * GENERATED PHP (LARAVEL) CONTROLLER FOR: ${table}
 * Created at: ${new Date().toLocaleString()}
 */

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\DB;

class ${table}Controller extends Controller {

    public function list() {
        $results = DB::select("SELECT * FROM ${table}");
        return response()->json($results);
    }

    public function save(Request $request) {
        // Executing the Stored Procedure
        $params = $request->all();
        DB::statement("CALL ${parent.name}(... )");
        
        return response()->json([
            "status" => "success",
            "message" => "Generated PHP code executed the Stored Procedure successfully"
        ]);
    }
}
`;
}
