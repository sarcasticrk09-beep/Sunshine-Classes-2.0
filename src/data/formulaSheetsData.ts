export interface FormulaItem {
  id: string;
  name: string;
  formula: string;
  variables?: string;
  notes?: string;
  example?: string;
}

export interface FormulaSection {
  title: string;
  category: string;
  formulas: FormulaItem[];
}

export interface FormulaSheetContent {
  id: string;
  title: string;
  subject: string;
  class: string;
  description: string;
  lastUpdated: string;
  sections: FormulaSection[];
}

export class FormulaSheetsData {
  static getFormulaSheet(materialIdOrSlug: string): FormulaSheetContent | null {
    const slug = materialIdOrSlug.toLowerCase();
    if (slug.includes('trigonometry') || slug.includes('mat178')) {
      return CLASS_10_TRIGONOMETRY_FORMULA_SHEET;
    }
    if (slug.includes('surface') || slug.includes('mat179') || slug.includes('volume') || slug.includes('3d')) {
      return CLASS_10_MENSURATION_FORMULA_SHEET;
    }
    if (slug.includes('physics') || slug.includes('mat180') || slug.includes('ray-diagram')) {
      return CLASS_10_PHYSICS_FORMULA_SHEET;
    }
    if (slug.includes('chemistry') || slug.includes('mat181') || slug.includes('valency')) {
      return CLASS_10_CHEMISTRY_FORMULA_SHEET;
    }
    if (slug.includes('class-9-math') || slug.includes('mat182') || slug.includes('class-9-mathematics')) {
      return CLASS_9_MATH_FORMULA_SHEET;
    }
    if (slug.includes('class-9-physics') || slug.includes('mat183') || slug.includes('equations-of-motion')) {
      return CLASS_9_PHYSICS_FORMULA_SHEET;
    }
    if (slug.includes('class-9-chemistry') || slug.includes('mat184') || slug.includes('mole-concept')) {
      return CLASS_9_CHEMISTRY_FORMULA_SHEET;
    }
    // Default master math formula sheet for Class 10
    if (slug.includes('mat177') || slug.includes('math') || slug.includes('formula')) {
      return CLASS_10_MATH_MASTER_FORMULA_SHEET;
    }
    return CLASS_10_MATH_MASTER_FORMULA_SHEET;
  }
}

export const CLASS_10_MATH_MASTER_FORMULA_SHEET: FormulaSheetContent = {
  id: 'mat177',
  title: 'Class 10 Mathematics Complete Formula Master Sheet',
  subject: 'Mathematics',
  class: 'Class 10',
  description: 'Official 2025-26 Board Exam formula sheet covering Algebra, Polynomials, AP, Trigonometry, Coordinate Geometry, Circles, Mensuration, and Statistics.',
  lastUpdated: 'June 2026',
  sections: [
    {
      title: 'Chapter 1: Real Numbers & Fundamental Algebra',
      category: 'Algebra',
      formulas: [
        {
          id: 'f-hcf-lcm',
          name: 'HCF & LCM Relationship',
          formula: 'HCF(a, b) × LCM(a, b) = a × b',
          variables: 'a, b = positive integers',
          notes: 'Applicable strictly for two positive integers.'
        },
        {
          id: 'f-euclid',
          name: 'Fundamental Theorem of Arithmetic',
          formula: 'Composite Number = p₁^k1 × p₂^k2 × ... × pₙ^kn',
          notes: 'Every composite number can be uniquely factored into prime powers.'
        }
      ]
    },
    {
      title: 'Chapter 2 & 4: Polynomials & Quadratic Equations',
      category: 'Algebra',
      formulas: [
        {
          id: 'f-poly-roots',
          name: 'Sum and Product of Roots (Quadratic Polynomial ax² + bx + c)',
          formula: 'α + β = -b / a,   α × β = c / a',
          variables: 'α, β = zeroes of polynomial, a ≠ 0'
        },
        {
          id: 'f-quad-formula',
          name: 'Quadratic Formula (Sridharacharya Method)',
          formula: 'x = (-b ± √(b² - 4ac)) / (2a)',
          variables: 'Discriminant D = b² - 4ac'
        },
        {
          id: 'f-quad-nature',
          name: 'Nature of Roots (based on Discriminant D)',
          formula: 'D > 0 → Two real & distinct roots\nD = 0 → Two equal real roots (x = -b/2a)\nD < 0 → No real roots (imaginary)',
          notes: 'If D is a perfect square, roots are rational.'
        }
      ]
    },
    {
      title: 'Chapter 5: Arithmetic Progressions (AP)',
      category: 'Algebra',
      formulas: [
        {
          id: 'f-ap-nth',
          name: 'n-th Term of an AP',
          formula: 'aₙ = a + (n - 1)d',
          variables: 'a = first term, d = common difference, n = term number'
        },
        {
          id: 'f-ap-sum',
          name: 'Sum of First n Terms of an AP',
          formula: 'Sₙ = (n / 2) [2a + (n - 1)d]   OR   Sₙ = (n / 2) [a + l]',
          variables: 'l = last term (aₙ)'
        },
        {
          id: 'f-ap-last-nth',
          name: 'n-th Term from the End',
          formula: 'aₙ(end) = l - (n - 1)d',
          variables: 'l = last term, d = common difference'
        }
      ]
    },
    {
      title: 'Chapter 7: Coordinate Geometry',
      category: 'Geometry',
      formulas: [
        {
          id: 'f-coord-dist',
          name: 'Distance Formula',
          formula: 'd = √[(x₂ - x₁)² + (y₂ - y₁)²]',
          notes: 'Distance from origin (0,0) to (x, y) is √(x² + y²)'
        },
        {
          id: 'f-coord-section',
          name: 'Section Formula (Internal Division in ratio m₁ : m₂)',
          formula: 'x = (m₁x₂ + m₂x₁) / (m₁ + m₂),   y = (m₁y₂ + m₂y₁) / (m₁ + m₂)'
        },
        {
          id: 'f-coord-mid',
          name: 'Mid-point Formula',
          formula: 'M = ((x₁ + x₂) / 2,  (y₁ + y₂) / 2)'
        },
        {
          id: 'f-coord-centroid',
          name: 'Centroid of a Triangle',
          formula: 'G = ((x₁ + x₂ + x₃) / 3,  (y₁ + y₂ + y₃) / 3)'
        }
      ]
    },
    {
      title: 'Chapter 8: Trigonometric Identities & Values',
      category: 'Trigonometry',
      formulas: [
        {
          id: 'f-trig-ratios',
          name: 'Trigonometric Ratios (P-B-P / H-H-B)',
          formula: 'sin θ = P/H,  cos θ = B/H,  tan θ = P/B\ncsc θ = H/P,  sec θ = H/B,  cot θ = B/P',
          variables: 'P = Perpendicular, B = Base, H = Hypotenuse'
        },
        {
          id: 'f-trig-identities',
          name: 'Fundamental Pythagorean Identities',
          formula: '1) sin² θ + cos² θ = 1\n2) 1 + tan² θ = sec² θ  (or sec² θ - tan² θ = 1)\n3) 1 + cot² θ = csc² θ  (or csc² θ - cot² θ = 1)'
        },
        {
          id: 'f-trig-reciprocals',
          name: 'Quotient & Reciprocal Relations',
          formula: 'tan θ = sin θ / cos θ,   cot θ = cos θ / sin θ\ncsc θ = 1 / sin θ,   sec θ = 1 / cos θ,   cot θ = 1 / tan θ'
        }
      ]
    },
    {
      title: 'Chapter 12 & 13: Mensuration (2D & 3D Figures)',
      category: 'Mensuration',
      formulas: [
        {
          id: 'f-mens-sector',
          name: 'Circle - Sector & Segment Area',
          formula: 'Area of Sector = (θ / 360°) × πr²\nLength of Arc (l) = (θ / 360°) × 2πr\nArea of Segment = Area of Sector - Area of Triangle'
        },
        {
          id: 'f-mens-cuboid',
          name: 'Cuboid (length l, width b, height h)',
          formula: 'TSA = 2(lb + bh + hl)\nLSA (4 walls) = 2h(l + b)\nVolume = l × b × h\nDiagonal = √(l² + b² + h²)'
        },
        {
          id: 'f-mens-cylinder',
          name: 'Right Circular Cylinder (radius r, height h)',
          formula: 'CSA = 2πrh\nTSA = 2πr(r + h)\nVolume = πr²h'
        },
        {
          id: 'f-mens-cone',
          name: 'Right Circular Cone (radius r, height h, slant height l)',
          formula: 'Slant Height (l) = √(r² + h²)\nCSA = πrl\nTSA = πr(r + l)\nVolume = (1/3)πr²h'
        },
        {
          id: 'f-mens-sphere',
          name: 'Sphere & Hemisphere (radius r)',
          formula: 'Sphere: Surface Area = 4πr²,  Volume = (4/3)πr³\nHemisphere: CSA = 2πr²,  TSA = 3πr²,  Volume = (2/3)πr³'
        }
      ]
    },
    {
      title: 'Chapter 14 & 15: Statistics & Probability',
      category: 'Statistics',
      formulas: [
        {
          id: 'f-stat-mean',
          name: 'Mean of Grouped Data',
          formula: 'Direct Method: x̄ = Σ(fᵢ xᵢ) / Σfᵢ\nAssumed Mean Method: x̄ = a + [Σ(fᵢ dᵢ) / Σfᵢ]   (dᵢ = xᵢ - a)',
          variables: 'a = assumed mean, fᵢ = frequency, xᵢ = class mark = (Upper + Lower) / 2'
        },
        {
          id: 'f-stat-mode',
          name: 'Mode of Grouped Data',
          formula: 'Mode = L + [ (f₁ - f₀) / (2f₁ - f₀ - f₂) ] × h',
          variables: 'L = lower limit of modal class, f₁ = frequency of modal class, f₀ = preceding class freq, f₂ = succeeding class freq, h = class width'
        },
        {
          id: 'f-stat-median',
          name: 'Median of Grouped Data',
          formula: 'Median = L + [ (N/2 - cf) / f ] × h',
          variables: 'L = lower limit of median class, N = Σfᵢ, cf = cumulative frequency of preceding class, f = frequency of median class'
        },
        {
          id: 'f-stat-empirical',
          name: 'Empirical Relationship',
          formula: '3 × Median = Mode + 2 × Mean',
          notes: 'Important 1-mark board exam formula'
        },
        {
          id: 'f-prob-basic',
          name: 'Probability of Event E',
          formula: 'P(E) = Number of Favourable Outcomes / Total Number of Outcomes\n0 ≤ P(E) ≤ 1,   P(E) + P(Not E) = 1'
        }
      ]
    }
  ]
};

export const CLASS_10_TRIGONOMETRY_FORMULA_SHEET: FormulaSheetContent = {
  id: 'mat178',
  title: 'Class 10 Trigonometry Cheat Sheet & Values Table',
  subject: 'Mathematics',
  class: 'Class 10',
  description: 'Complete quick-reference table for standard angles (0°, 30°, 45°, 60°, 90°), complementary ratios, and fundamental Pythagorean identities.',
  lastUpdated: 'June 2026',
  sections: [
    {
      title: 'Standard Angle Trigonometric Values Table',
      category: 'Values',
      formulas: [
        {
          id: 't-0',
          name: '0° Angle Values',
          formula: 'sin 0° = 0 | cos 0° = 1 | tan 0° = 0 | csc 0° = ND | sec 0° = 1 | cot 0° = ND'
        },
        {
          id: 't-30',
          name: '30° Angle Values',
          formula: 'sin 30° = 1/2 | cos 30° = √3/2 | tan 30° = 1/√3 | csc 30° = 2 | sec 30° = 2/√3 | cot 30° = √3'
        },
        {
          id: 't-45',
          name: '45° Angle Values',
          formula: 'sin 45° = 1/√2 | cos 45° = 1/√2 | tan 45° = 1 | csc 45° = √2 | sec 45° = √2 | cot 45° = 1'
        },
        {
          id: 't-60',
          name: '60° Angle Values',
          formula: 'sin 60° = √3/2 | cos 60° = 1/2 | tan 60° = √3 | csc 60° = 2/√3 | sec 60° = 2 | cot 60° = 1/√3'
        },
        {
          id: 't-90',
          name: '90° Angle Values',
          formula: 'sin 90° = 1 | cos 90° = 0 | tan 90° = ND | csc 90° = 1 | sec 90° = ND | cot 90° = 0'
        }
      ]
    },
    {
      title: 'Pythagorean & Quotient Identities',
      category: 'Identities',
      formulas: [
        {
          id: 'trig-id-1',
          name: 'Sine & Cosine Identity',
          formula: 'sin² θ + cos² θ = 1  ⟹  sin² θ = 1 - cos² θ,  cos² θ = 1 - sin² θ'
        },
        {
          id: 'trig-id-2',
          name: 'Tangent & Secant Identity',
          formula: '1 + tan² θ = sec² θ  ⟹  sec² θ - tan² θ = 1,  tan² θ = sec² θ - 1'
        },
        {
          id: 'trig-id-3',
          name: 'Cotangent & Cosecant Identity',
          formula: '1 + cot² θ = csc² θ  ⟹  csc² θ - cot² θ = 1,  cot² θ = csc² θ - 1'
        }
      ]
    }
  ]
};

export const CLASS_10_MENSURATION_FORMULA_SHEET: FormulaSheetContent = {
  id: 'mat179',
  title: 'Class 10 Surface Areas & Volumes 3D Shapes Formula Sheet',
  subject: 'Mathematics',
  class: 'Class 10',
  description: 'Master summary of Curved Surface Area (CSA), Total Surface Area (TSA), and Volume formulas for all 3D solid figures.',
  lastUpdated: 'June 2026',
  sections: [
    {
      title: '3D Solid Shapes Reference List',
      category: 'Mensuration',
      formulas: [
        {
          id: 'm-cube',
          name: 'Cube (side length = a)',
          formula: 'LSA = 4a²\nTSA = 6a²\nVolume = a³\nDiagonal = a√3'
        },
        {
          id: 'm-cuboid',
          name: 'Cuboid (length l, width b, height h)',
          formula: 'LSA = 2h(l + b)\nTSA = 2(lb + bh + hl)\nVolume = l × b × h\nDiagonal = √(l² + b² + h²)'
        },
        {
          id: 'm-cylinder',
          name: 'Right Circular Cylinder (radius r, height h)',
          formula: 'CSA = 2πrh\nTSA = 2πr(r + h)\nVolume = πr²h\nHollow Cylinder Vol = πh(R² - r²)'
        },
        {
          id: 'm-cone',
          name: 'Right Circular Cone (radius r, height h)',
          formula: 'Slant Height (l) = √(r² + h²)\nCSA = πrl\nTSA = πr(r + l)\nVolume = (1/3)πr²h'
        },
        {
          id: 'm-sphere',
          name: 'Sphere (radius r)',
          formula: 'Surface Area = 4πr²\nVolume = (4/3)πr³'
        },
        {
          id: 'm-hemisphere',
          name: 'Hemisphere (radius r)',
          formula: 'CSA = 2πr²\nTSA = 3πr²\nVolume = (2/3)πr³'
        }
      ]
    }
  ]
};

export const CLASS_10_PHYSICS_FORMULA_SHEET: FormulaSheetContent = {
  id: 'mat180',
  title: 'Class 10 Science Physics Numerical Formula Cheat Sheet',
  subject: 'Science (Physics)',
  class: 'Class 10',
  description: 'Key physics numerical equations for Light (Reflection & Refraction), Human Eye, Electricity, and Magnetic Effects.',
  lastUpdated: 'June 2026',
  sections: [
    {
      title: 'Unit 1: Optics - Light Reflection & Refraction',
      category: 'Optics',
      formulas: [
        {
          id: 'p-mirror',
          name: 'Spherical Mirror Formula',
          formula: '1/f = 1/v + 1/u',
          variables: 'u = object dist (-ve), v = image dist, f = focal length (f = R/2)\nConcave Mirror: f is -ve | Convex Mirror: f is +ve'
        },
        {
          id: 'p-mirror-mag',
          name: 'Mirror Magnification',
          formula: 'm = hᵢ / hₒ = -v / u',
          notes: 'm > 0 → Virtual & erect | m < 0 → Real & inverted | |m| > 1 → Enlarged'
        },
        {
          id: 'p-snell',
          name: 'Snell’s Law of Refraction & Refractive Index',
          formula: 'n₂₁ = sin i / sin r = v₁ / v₂\nAbsolute Refractive Index n = c / v',
          variables: 'c = 3 × 10⁸ m/s (speed of light in vacuum)'
        },
        {
          id: 'p-lens',
          name: 'Lens Formula & Magnification',
          formula: '1/f = 1/v - 1/u,   m = hᵢ / hₒ = v / u',
          notes: 'Convex Lens: f is +ve | Concave Lens: f is -ve'
        },
        {
          id: 'p-power',
          name: 'Power of a Lens',
          formula: 'P = 1 / f (in metres)   [Unit: Dioptre, D]\nFor combined lenses: P_total = P₁ + P₂ + P₃',
          notes: 'Convex Lens P > 0 (+D) | Concave Lens P < 0 (-D)'
        }
      ]
    },
    {
      title: 'Unit 2: Electricity & Heating Effects',
      category: 'Electricity',
      formulas: [
        {
          id: 'p-charge',
          name: 'Electric Charge & Current',
          formula: 'Q = n × e,   I = Q / t',
          variables: 'e = 1.6 × 10⁻¹⁹ C, I in Amperes (A)'
        },
        {
          id: 'p-ohm',
          name: 'Ohm’s Law & Resistivity',
          formula: 'V = I × R,   R = ρ × (L / A)',
          variables: 'ρ = electrical resistivity (Ω·m), L = length, A = cross-sectional area'
        },
        {
          id: 'p-res-series',
          name: 'Series Resistors',
          formula: 'R_series = R₁ + R₂ + R₃',
          notes: 'Current I is constant across all series resistors; total voltage V = V₁ + V₂ + V₃'
        },
        {
          id: 'p-res-parallel',
          name: 'Parallel Resistors',
          formula: '1 / R_parallel = 1/R₁ + 1/R₂ + 1/R₃',
          notes: 'Voltage V is constant across parallel branches; equivalent R is smaller than individual R'
        },
        {
          id: 'p-joule-heat',
          name: 'Joule’s Law of Heating',
          formula: 'H = I² × R × t = V × I × t = (V² / R) × t',
          variables: 'H in Joules (J)'
        },
        {
          id: 'p-elec-power',
          name: 'Electric Power & Commercial Unit',
          formula: 'P = V × I = I²R = V² / R   [Unit: Watt (W)]\n1 kWh (1 Unit) = 3.6 × 10⁶ Joules',
          notes: 'Commercial energy (kWh) = (Power in Watts × hours) / 1000'
        }
      ]
    }
  ]
};

export const CLASS_10_CHEMISTRY_FORMULA_SHEET: FormulaSheetContent = {
  id: 'mat181',
  title: 'Class 10 Chemistry Reaction Chart & Valency Sheet',
  subject: 'Science (Chemistry)',
  class: 'Class 10',
  description: 'Reactivity series, common ions valency table, pH scale ranges, and key balanced chemical equations.',
  lastUpdated: 'June 2026',
  sections: [
    {
      title: 'Valency & Common Ions Quick Table',
      category: 'Valency',
      formulas: [
        {
          id: 'c-cations',
          name: 'Common Cations (Positive Ions)',
          formula: 'Monovalent (+1): Na⁺, K⁺, Ag⁺, H⁺, NH₄⁺\nDivalent (+2): Mg²⁺, Ca²⁺, Zn²⁺, Fe²⁺, Cu²⁺, Pb²⁺\nTrivalent (+3): Al³⁺, Fe³⁺'
        },
        {
          id: 'c-anions',
          name: 'Common Anions (Negative Ions)',
          formula: 'Monovalent (-1): Cl⁻, Br⁻, OH⁻, NO₃⁻, HCO₃⁻\nDivalent (-2): O²⁻, S²⁻, SO₄²⁻, CO₃²⁻\nTrivalent (-3): N³⁻, PO₄³⁻'
        }
      ]
    },
    {
      title: 'Reactivity Series of Metals (Decreasing Order)',
      category: 'Reactivity',
      formulas: [
        {
          id: 'c-reactivity',
          name: 'Metal Reactivity Order',
          formula: 'K > Na > Ca > Mg > Al > Zn > Fe > Pb > [H] > Cu > Hg > Ag > Au',
          notes: 'Metals above [H] displace hydrogen from dilute acids.'
        }
      ]
    },
    {
      title: 'Important Board Exam Chemical Equations',
      category: 'Equations',
      formulas: [
        {
          id: 'c-eq-chloralkali',
          name: 'Chlor-Alkali Process (Manufacture of NaOH)',
          formula: '2NaCl(aq) + 2H₂O(l) ⎯(Electricity)→ 2NaOH(aq) + Cl₂(g) + H₂(g)'
        },
        {
          id: 'c-eq-pop',
          name: 'Plaster of Paris & Gypsum',
          formula: 'CaSO₄·½H₂O + 1½H₂O → CaSO₄·2H₂O (Gypsum hard mass)'
        },
        {
          id: 'c-eq-thermite',
          name: 'Thermite Process (Welding Rails)',
          formula: 'Fe₂O₃(s) + 2Al(s) → 2Fe(l) + Al₂O₃(s) + Heat'
        },
        {
          id: 'c-eq-ester',
          name: 'Esterification Reaction',
          formula: 'CH₃COOH + C₂H₅OH ⎯(conc. H₂SO₄)→ CH₃COOC₂H₅ (Sweet smelling Ester) + H₂O'
        }
      ]
    }
  ]
};

export const CLASS_9_MATH_FORMULA_SHEET: FormulaSheetContent = {
  id: 'mat182',
  title: 'Class 9 Mathematics Master Formula Sheet & Algebraic Identities',
  subject: 'Mathematics',
  class: 'Class 9',
  description: 'Complete formula summary including Polynomial Identities, Heron’s Formula, Lines & Angles, Coordinate Geometry, and Surface Areas.',
  lastUpdated: 'June 2026',
  sections: [
    {
      title: 'Algebraic Identities (Polynomials)',
      category: 'Algebra',
      formulas: [
        { id: 'c9-alg-1', name: '(a + b)²', formula: '(a + b)² = a² + 2ab + b²' },
        { id: 'c9-alg-2', name: '(a - b)²', formula: '(a - b)² = a² - 2ab + b²' },
        { id: 'c9-alg-3', name: 'a² - b²', formula: 'a² - b² = (a + b)(a - b)' },
        { id: 'c9-alg-4', name: '(x + a)(x + b)', formula: '(x + a)(x + b) = x² + (a + b)x + ab' },
        { id: 'c9-alg-5', name: '(a + b + c)²', formula: '(a + b + c)² = a² + b² + c² + 2ab + 2bc + 2ca' },
        { id: 'c9-alg-6', name: '(a + b)³', formula: '(a + b)³ = a³ + b³ + 3ab(a + b)' },
        { id: 'c9-alg-7', name: '(a - b)³', formula: '(a - b)³ = a³ - b³ - 3ab(a - b)' },
        { id: 'c9-alg-8', name: 'a³ + b³ + c³ - 3abc', formula: 'a³ + b³ + c³ - 3abc = (a + b + c)(a² + b² + c² - ab - bc - ca)\nIf a + b + c = 0 ⟹ a³ + b³ + c³ = 3abc' }
      ]
    },
    {
      title: 'Heron’s Formula (Area of Triangles)',
      category: 'Geometry',
      formulas: [
        {
          id: 'c9-heron',
          name: 'Heron’s Area Formula',
          formula: 's = (a + b + c) / 2   [Semi-perimeter]\nArea = √[s(s - a)(s - b)(s - c)]',
          variables: 'a, b, c = side lengths of triangle'
        },
        {
          id: 'c9-equilateral',
          name: 'Equilateral Triangle Area',
          formula: 'Area = (√3 / 4) × a²,   Height h = (√3 / 2) × a'
        }
      ]
    }
  ]
};

export const CLASS_9_PHYSICS_FORMULA_SHEET: FormulaSheetContent = {
  id: 'mat183',
  title: 'Class 9 Physics Motion, Force & Gravitation Formula Sheet',
  subject: 'Science (Physics)',
  class: 'Class 9',
  description: 'Uniform acceleration equations of motion, momentum, Newton’s laws, universal gravitation, and work-energy formulas.',
  lastUpdated: 'June 2026',
  sections: [
    {
      title: 'Equations of Motion (Uniform Acceleration)',
      category: 'Motion',
      formulas: [
        { id: 'c9-p-eq1', name: '1st Equation of Motion', formula: 'v = u + at' },
        { id: 'c9-p-eq2', name: '2nd Equation of Motion', formula: 's = ut + (1/2)at²' },
        { id: 'c9-p-eq3', name: '3rd Equation of Motion', formula: 'v² - u² = 2as' },
        { id: 'c9-p-avg-v', name: 'Average Velocity', formula: 'v_avg = (u + v) / 2 = Total Displacement / Total Time' }
      ]
    },
    {
      title: 'Force, Momentum & Gravitation',
      category: 'Force',
      formulas: [
        { id: 'c9-p-mom', name: 'Momentum & Newton’s 2nd Law', formula: 'p = m × v,   F = m × a = (p₂ - p₁) / t' },
        { id: 'c9-p-grav', name: 'Universal Law of Gravitation', formula: 'F = G × (m₁ × m₂) / d²', variables: 'G = 6.673 × 10⁻¹¹ N·m²/kg²' },
        { id: 'c9-p-g', name: 'Acceleration due to Gravity', formula: 'g = G × M / R² ≈ 9.8 m/s² (Earth surface)' },
        { id: 'c9-p-work', name: 'Work, Kinetic & Potential Energy', formula: 'Work W = F × s\nKinetic Energy E_k = (1/2)m v²\nPotential Energy E_p = m × g × h\nPower P = W / t   [1 Watt = 1 J/s]' }
      ]
    }
  ]
};

export const CLASS_9_CHEMISTRY_FORMULA_SHEET: FormulaSheetContent = {
  id: 'mat184',
  title: 'Class 9 Chemistry Chemical Formula Writing & Mole Concept Sheet',
  subject: 'Science (Chemistry)',
  class: 'Class 9',
  description: 'Atomic mass reference, mole conversions, chemical formula criss-cross method, and percentage mass composition.',
  lastUpdated: 'June 2026',
  sections: [
    {
      title: 'Mole Concept Conversions',
      category: 'Mole Concept',
      formulas: [
        {
          id: 'c9-c-mole1',
          name: 'Number of Moles from Mass',
          formula: 'n = Given Mass (m) / Molar Mass (M)'
        },
        {
          id: 'c9-c-mole2',
          name: 'Number of Moles from Particle Count',
          formula: 'n = Number of Particles (N) / Avogadro Constant (N_A)',
          variables: 'N_A = 6.022 × 10²³ particles/mol'
        },
        {
          id: 'c9-c-mass-pct',
          name: 'Mass Percentage of Element',
          formula: 'Mass % = (Mass of element in 1 mole / Molar Mass of Compound) × 100%'
        }
      ]
    }
  ]
};
