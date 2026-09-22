// 1. Import machine images from the assets folder using relative paths
import angleGrinderImg from "../assets/angle-grinder-machine.png";
import breakerImg from "../assets/breaker.png";
import cutOffMachineImg from "../assets/cut-off-machine.png";
import earthRammerImg from "../assets/earth-rammer.png";
import electricalVibratorImg from "../assets/electrical-vibrator.png";
import liftMachineImg from "../assets/lift-machine.png";
import marbleCutterImg from "../assets/marble-cutter.png";
import woodCuttingMachineImg from "../assets/wood-cutting-machine.png";

// 2. Import scaffolding images directly from your assets folder
import columnBoxImg from "../assets/column-box.png";
import spanImg from "../assets/span.png";
import centeringSheetImg from "../assets/centering-sheet.png";
import sideSheetImg from "../assets/side sheet.png"; 
import jackImg from "../assets/jack.png";
import plinthBeamImg from "../assets/plinth-beam.png";
import causerenoPoleImg from "../assets/causereno-pole.png"; 
import adjCenteringSheetImg from "../assets/Adjustable Centering sheet.png"; 
// 👉 NEW: Imported the new scaffolding image
import scaffoldingImg from "../assets/scaffolding.png"; 

// 3. Export the products array with the new availability property
export const products = [
  // --- MACHINES ---
  { id: 1, name: 'Angle Grinder Machine', type: 'machine', image: angleGrinderImg, category: 'Cutting & Grinding', price: 100, availability: 10 },
  { id: 4, name: 'Electric Vibrator', type: 'machine', image: electricalVibratorImg, category: 'Compaction Equipment', price: 200, availability: 10 },
  { id: 6, name: 'Cut Off Machine', type: 'machine', image: cutOffMachineImg, category: 'Cutting & Grinding', price: 500, availability: 10 },
  { id: 7, name: 'Breaker', type: 'machine', image: breakerImg, category: 'Demolition Tools', price: 500, availability: 10 },
  { id: 8, name: 'Marble Cutter', type: 'machine', image: marbleCutterImg, category: 'Cutting & Grinding', price: 350, availability: 10 },
  { id: 9, name: 'Lift Machine', type: 'machine', image: liftMachineImg, category: 'Lifting Equipment', price: 2000, availability: 10 },
  { id: 10, name: 'Earth Rammer', type: 'machine', image: earthRammerImg, category: 'Compaction Equipment', price: 1000, availability: 10 },
  { id: 11, name: 'Wood Cutting Machine', type: 'machine', image: woodCuttingMachineImg, category: 'Cutting & Grinding', price: 250, availability: 10 },

  // --- SCAFFOLDING & CENTERING MATERIALS ---
  { 
    id: 13, 
    name: 'Column Box', 
    type: 'scaffolding', 
    image: columnBoxImg, 
    category: 'Column Boxes', 
    price: 80, 
    availability: 10,
    hasVariants: true,
    variants: [
      { name: '4ft', price: 80 },
      { name: '6ft', price: 120 },
      { name: '8ft', price: 150 }
    ]
  },
  { 
    id: 14, 
    name: 'Span', 
    type: 'scaffolding', 
    image: spanImg, 
    category: 'Props & Jacks', 
    price: 3.50, 
    availability: 10 
  },
  { 
    id: 15, 
    name: 'Centering Sheet', 
    type: 'scaffolding', 
    image: centeringSheetImg, 
    category: 'Centering Sheets', 
    price: 1.50, 
    availability: 10,
    hasVariants: true,
    variants: [
      { name: '3x2', price: 1.50 },
      { name: '4x2', price: 3 },
      { name: '4x1.5', price: 2.50 }
    ]
  },
  { 
    id: 16, 
    name: 'Side Sheet', 
    type: 'scaffolding', 
    image: sideSheetImg, 
    category: 'Side Sheets', 
    price: 10, 
    availability: 10,
    hasVariants: true,
    variants: [
      { name: '4x2', price: 10 },
      { name: '6x2', price: 15 }
    ]
  },
  { 
    id: 17, 
    name: 'Jack', 
    type: 'scaffolding', 
    image: jackImg, 
    category: 'Props & Jacks', 
    price: 2.50, 
    availability: 10,
    hasVariants: true,
    variants: [
      { name: 'Small', price: 2.50 },
      { name: 'Big', price: 4 }
    ]
  },
  { 
    id: 18, 
    name: 'Scaffolding (per sq ft)', 
    type: 'scaffolding', 
    image: scaffoldingImg, // 👉 Attached the new image here
    category: 'Scaffolding', 
    price: 10, 
    availability: 10 
  },
  { 
    id: 19, 
    name: 'Adjustable Centering Sheet', 
    type: 'scaffolding', 
    image: adjCenteringSheetImg, 
    category: 'Half Sheet', 
    price: 1.50, 
    availability: 10 
  },
  { 
    id: 20, 
    name: 'Plinth Beam Sheets', 
    type: 'scaffolding', 
    image: plinthBeamImg, 
    category: 'Side Sheet', 
    price: 10, 
    availability: 10,
    hasVariants: true,
    variants: [
      { name: 'Side 4x2', price: 10 },
      { name: 'Side 6x2', price: 15 }
    ]
  },
  { 
    id: 21, 
    name: 'Prop', 
    type: 'scaffolding', 
    image: causerenoPoleImg, 
    category: 'Wood Pole', 
    price: 1.50, 
    availability: 10,
    hasVariants: true,
    variants: [
      { name: '3ft', price: 1.50 },
      { name: '4ft', price: 2.50 }
    ]
  }
];

export default products;