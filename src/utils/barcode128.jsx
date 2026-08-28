// OmniBuild OS™ — Pure JavaScript GS1 Code-128 Vector Barcode Engine
// Standard Code-128B / GS1-128 encoding producing crisp, high-density SVG paths

const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"                                   // 100-106 (Stop)
];

const START_CODE_B = 104;
const STOP_CODE = 106;

export function encodeCode128(inputString) {
  const text = String(inputString || "SKU-001");
  
  const codes = [START_CODE_B];
  let checksum = START_CODE_B;

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    let value = charCode - 32; // Code 128B ASCII mapping
    if (value < 0 || value > 95) value = 0;
    codes.push(value);
    checksum += value * (i + 1);
  }

  const checkDigit = checksum % 103;
  codes.push(checkDigit);
  codes.push(STOP_CODE);

  // Convert codes to bar pattern string (e.g. "212222...")
  let pattern = "";
  for (let i = 0; i < codes.length; i++) {
    pattern += CODE128_PATTERNS[codes[i]] || CODE128_PATTERNS[0];
  }

  return { pattern, text, checkDigit };
}

// React Component to Render Code-128 SVG Barcode Lines
export function Code128Barcode({ 
  value, 
  text, 
  height = 50, 
  width, 
  moduleWidth = 1.6,
  showText = true, 
  fontSize = 11,
  color = "#000000",
  bearerBars = false,
  bearerBarThickness = 3,
  quietZone = true
}) {
  const dataValue = String(value || text || "BED-MOD-001");
  const { pattern } = encodeCode128(dataValue);
  
  // Calculate total modules in pattern
  let totalModules = 0;
  for (let i = 0; i < pattern.length; i++) {
    totalModules += parseInt(pattern[i], 10);
  }

  // Quiet zones (10 modules left and right)
  const qzModules = quietZone ? 10 : 0;
  const grandTotalModules = totalModules + (qzModules * 2);

  // If width is explicitly provided (e.g. 240px), derive moduleWidth, else use moduleWidth
  const computedModuleWidth = width && width > 10 ? width / grandTotalModules : moduleWidth;
  const svgWidth = Math.round(grandTotalModules * computedModuleWidth);
  const svgHeight = height;

  let currentX = qzModules * computedModuleWidth;
  const rects = [];

  for (let i = 0; i < pattern.length; i++) {
    const barWidth = parseInt(pattern[i], 10) * computedModuleWidth;
    const isBar = i % 2 === 0; // Alternates: bar, space, bar, space...
    
    if (isBar) {
      rects.push(
        <rect 
          key={i} 
          x={currentX} 
          y={bearerBars ? bearerBarThickness : 0} 
          width={barWidth} 
          height={bearerBars ? svgHeight - (bearerBarThickness * 2) : svgHeight} 
          fill={color} 
        />
      );
    }
    currentX += barWidth;
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', background: '#FFFFFF', padding: '6px 10px', borderRadius: '6px' }}>
      <svg 
        width={svgWidth} 
        height={svgHeight} 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ display: 'block', shapeRendering: 'crispEdges' }}
      >
        {/* Industrial Bearer Bars (Top and Bottom Guard Lines) */}
        {bearerBars && (
          <>
            <rect x={0} y={0} width={svgWidth} height={bearerBarThickness} fill={color} />
            <rect x={0} y={svgHeight - bearerBarThickness} width={svgWidth} height={bearerBarThickness} fill={color} />
          </>
        )}
        {rects}
      </svg>

      {showText && (
        <div style={{ 
          fontFamily: "'JetBrains Mono', 'Courier New', monospace", 
          fontSize: `${fontSize}px`, 
          fontWeight: '900', 
          color: color, 
          letterSpacing: '2px', 
          marginTop: '3px',
          textAlign: 'center'
        }}>
          *{dataValue}*
        </div>
      )}
    </div>
  );
}
