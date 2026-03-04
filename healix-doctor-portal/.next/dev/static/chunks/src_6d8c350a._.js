(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/data/mockData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DOCTORS",
    ()=>DOCTORS,
    "HOSPITALS",
    ()=>HOSPITALS,
    "SPECIALIZATIONS",
    ()=>SPECIALIZATIONS,
    "TIME_SLOTS",
    ()=>TIME_SLOTS
]);
const SPECIALIZATIONS = [
    "General Practitioner",
    "Cardiologist",
    "Dermatologist",
    "Neurologist",
    "Orthopedic Surgeon",
    "Pediatrician",
    "Psychiatrist",
    "Gynecologist",
    "Ophthalmologist",
    "ENT Specialist",
    "Diabetologist",
    "Urologist"
];
const HOSPITALS = [
    "Colombo National Hospital",
    "Lanka Hospital",
    "Asiri Medical",
    "Nawaloka Hospital",
    "Durdans Hospital",
    "Hemas Hospital",
    "Central Hospital",
    "Ninewells Hospital"
];
const DOCTORS = [
    {
        id: 1,
        name: "Dr. Ayesha Perera",
        specialization: "Cardiologist",
        hospital: "Lanka Hospital",
        otherHospitals: [
            {
                name: "Nawaloka Hospital",
                days: "Mon, Wed",
                hours: "6:00 PM – 8:00 PM"
            },
            {
                name: "Asiri Medical",
                days: "Fri",
                hours: "5:00 PM – 7:00 PM"
            }
        ],
        fee: 3500,
        serviceFee: 150,
        available: true,
        experience: "15+ years",
        languages: [
            "English",
            "Sinhala"
        ],
        initials: "AP",
        qualifications: "MBBS, MD (Cardiology), MRCP"
    },
    {
        id: 2,
        name: "Dr. Nuwan Silva",
        specialization: "General Practitioner",
        hospital: "Nawaloka Hospital",
        otherHospitals: [
            {
                name: "Central Hospital",
                days: "Tue, Thu",
                hours: "5:00 PM – 7:00 PM"
            }
        ],
        fee: 2000,
        serviceFee: 150,
        available: true,
        experience: "8+ years",
        languages: [
            "English",
            "Sinhala",
            "Tamil"
        ],
        initials: "NS",
        qualifications: "MBBS, DRCOG"
    },
    {
        id: 3,
        name: "Dr. Roshani Fernando",
        specialization: "Dermatologist",
        hospital: "Asiri Medical",
        otherHospitals: [],
        fee: 2800,
        serviceFee: 150,
        available: false,
        experience: "10+ years",
        languages: [
            "English",
            "Sinhala"
        ],
        initials: "RF",
        qualifications: "MBBS, MD (Dermatology)"
    },
    {
        id: 4,
        name: "Dr. Kamal Jayawardena",
        specialization: "Neurologist",
        hospital: "Colombo National Hospital",
        otherHospitals: [
            {
                name: "Lanka Hospital",
                days: "Sat",
                hours: "9:00 AM – 12:00 PM"
            }
        ],
        fee: 4000,
        serviceFee: 150,
        available: true,
        experience: "20+ years",
        languages: [
            "English",
            "Sinhala"
        ],
        initials: "KJ",
        qualifications: "MBBS, MD, FRCP (Neurology)"
    },
    {
        id: 5,
        name: "Dr. Priya Wijesinghe",
        specialization: "Pediatrician",
        hospital: "Durdans Hospital",
        otherHospitals: [
            {
                name: "Hemas Hospital",
                days: "Mon, Fri",
                hours: "4:00 PM – 6:00 PM"
            }
        ],
        fee: 2500,
        serviceFee: 150,
        available: true,
        experience: "12+ years",
        languages: [
            "English",
            "Sinhala",
            "Tamil"
        ],
        initials: "PW",
        qualifications: "MBBS, DCH, MD (Paediatrics)"
    },
    {
        id: 6,
        name: "Dr. Sanath Rathnayake",
        specialization: "Orthopedic Surgeon",
        hospital: "Hemas Hospital",
        otherHospitals: [],
        fee: 4500,
        serviceFee: 150,
        available: true,
        experience: "18+ years",
        languages: [
            "English",
            "Sinhala"
        ],
        initials: "SR",
        qualifications: "MBBS, MS (Ortho), FRCS"
    }
];
const TIME_SLOTS = [
    {
        time: "08:00 AM",
        booked: false
    },
    {
        time: "08:30 AM",
        booked: true
    },
    {
        time: "09:00 AM",
        booked: false
    },
    {
        time: "09:30 AM",
        booked: true
    },
    {
        time: "10:00 AM",
        booked: false
    },
    {
        time: "10:30 AM",
        booked: false
    },
    {
        time: "11:00 AM",
        booked: true
    },
    {
        time: "02:00 PM",
        booked: false
    },
    {
        time: "02:30 PM",
        booked: false
    },
    {
        time: "03:00 PM",
        booked: true
    },
    {
        time: "03:30 PM",
        booked: false
    },
    {
        time: "04:00 PM",
        booked: false
    },
    {
        time: "04:30 PM",
        booked: true
    },
    {
        time: "05:00 PM",
        booked: false
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatCurrency",
    ()=>formatCurrency,
    "formatDate",
    ()=>formatDate,
    "generateAppointmentId",
    ()=>generateAppointmentId
]);
function formatDate(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}
function formatCurrency(amount) {
    return `Rs. ${amount.toLocaleString()}`;
}
function generateAppointmentId() {
    return `SP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/Calendar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Calendar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];
const DAY_NAMES = [
    "Su",
    "Mo",
    "Tu",
    "We",
    "Th",
    "Fr",
    "Sa"
];
function Calendar({ selected, onSelect }) {
    _s();
    const today = new Date();
    const [month, setMonth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(today.getMonth());
    const [year, setYear] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(today.getFullYear());
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const isPast = (day)=>{
        const d = new Date(year, month, day);
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return d < t;
    };
    const fmt = (d)=>`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const prevMonth = ()=>month === 0 ? (setMonth(11), setYear((y)=>y - 1)) : setMonth((m)=>m - 1);
    const nextMonth = ()=>month === 11 ? (setMonth(0), setYear((y)=>y + 1)) : setMonth((m)=>m + 1);
    const cells = [
        ...Array.from({
            length: firstDay
        }, ()=>null),
        ...Array.from({
            length: daysInMonth
        }, (_, i)=>i + 1)
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "animate-scale-in",
        style: {
            background: "rgba(8, 18, 40, 0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            borderRadius: 16,
            padding: 20,
            width: 280,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.05)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: prevMonth,
                        style: {
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            border: "1px solid rgba(56,189,248,0.15)",
                            background: "rgba(14,165,233,0.08)",
                            color: "#38bdf8",
                            cursor: "pointer",
                            fontSize: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.2s"
                        },
                        onMouseEnter: (e)=>e.currentTarget.style.background = "rgba(14,165,233,0.18)",
                        onMouseLeave: (e)=>e.currentTarget.style.background = "rgba(14,165,233,0.08)",
                        children: "‹"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Calendar.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontFamily: "Syne, sans-serif",
                            fontWeight: 700,
                            color: "#f1f5f9",
                            fontSize: 14
                        },
                        children: [
                            MONTH_NAMES[month],
                            " ",
                            year
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ui/Calendar.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: nextMonth,
                        style: {
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            border: "1px solid rgba(56,189,248,0.15)",
                            background: "rgba(14,165,233,0.08)",
                            color: "#38bdf8",
                            cursor: "pointer",
                            fontSize: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.2s"
                        },
                        onMouseEnter: (e)=>e.currentTarget.style.background = "rgba(14,165,233,0.18)",
                        onMouseLeave: (e)=>e.currentTarget.style.background = "rgba(14,165,233,0.08)",
                        children: "›"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Calendar.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/Calendar.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    marginBottom: 8
                },
                children: DAY_NAMES.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: "center",
                            fontSize: 10,
                            color: "#475569",
                            fontWeight: 600,
                            padding: "4px 0"
                        },
                        children: d
                    }, d, false, {
                        fileName: "[project]/src/components/ui/Calendar.tsx",
                        lineNumber: 86,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Calendar.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 3
                },
                children: cells.map((day, i)=>{
                    if (!day) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, i, false, {
                        fileName: "[project]/src/components/ui/Calendar.tsx",
                        lineNumber: 95,
                        columnNumber: 28
                    }, this);
                    const past = isPast(day);
                    const sel = selected === fmt(day);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: past,
                        onClick: ()=>onSelect(fmt(day)),
                        style: {
                            height: 32,
                            borderRadius: 8,
                            border: sel ? "1px solid rgba(14,165,233,0.6)" : "1px solid transparent",
                            background: sel ? "linear-gradient(135deg, #0ea5e9, #38bdf8)" : "transparent",
                            color: sel ? "#fff" : past ? "#1e293b" : "#cbd5e1",
                            fontSize: 12,
                            fontWeight: sel ? 700 : 400,
                            cursor: past ? "not-allowed" : "pointer",
                            transition: "all 0.15s",
                            boxShadow: sel ? "0 0 12px rgba(14,165,233,0.4)" : "none"
                        },
                        onMouseEnter: (e)=>{
                            if (!past && !sel) {
                                e.currentTarget.style.background = "rgba(14,165,233,0.1)";
                                e.currentTarget.style.color = "#fff";
                            }
                        },
                        onMouseLeave: (e)=>{
                            if (!past && !sel) {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "#cbd5e1";
                            }
                        },
                        children: day
                    }, i, false, {
                        fileName: "[project]/src/components/ui/Calendar.tsx",
                        lineNumber: 99,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Calendar.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Calendar.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_s(Calendar, "Ra44TV1ssDKYlsG3s1v0NZLN1dA=");
_c = Calendar;
var _c;
__turbopack_context__.k.register(_c, "Calendar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/Button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function Button({ variant = "primary", size = "md", className = "", style = {}, children, ...props }) {
    const sizeStyles = size === "sm" ? {
        padding: "6px 14px",
        fontSize: 12
    } : size === "lg" ? {
        padding: "13px 28px",
        fontSize: 15
    } : {
        padding: "10px 20px",
        fontSize: 14
    };
    if (variant === "ghost") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            style: {
                background: "none",
                border: "none",
                color: "#38bdf8",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
                fontSize: size === "sm" ? 13 : 14,
                fontFamily: "DM Sans, sans-serif",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                opacity: 0.85,
                transition: "opacity 0.2s",
                ...style
            },
            onMouseEnter: (e)=>e.currentTarget.style.opacity = "1",
            onMouseLeave: (e)=>e.currentTarget.style.opacity = "0.85",
            ...props,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/components/ui/Button.tsx",
            lineNumber: 25,
            columnNumber: 7
        }, this);
    }
    if (variant === "secondary") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            className: `btn-ghost ${className}`,
            style: {
                ...sizeStyles,
                fontFamily: "DM Sans, sans-serif",
                ...style
            },
            ...props,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/components/ui/Button.tsx",
            lineNumber: 53,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        className: `btn-glow ${className}`,
        style: {
            ...sizeStyles,
            fontFamily: "DM Sans, sans-serif",
            ...style
        },
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Button.tsx",
        lineNumber: 64,
        columnNumber: 5
    }, this);
}
_c = Button;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/doctors/SearchFilters.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SearchFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/mockData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Calendar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Calendar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Button.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const selectStyle = {
    width: "100%",
    background: "rgba(14, 28, 54, 0.8)",
    border: "1px solid rgba(56, 189, 248, 0.15)",
    borderRadius: 12,
    padding: "10px 16px",
    color: "#f1f5f9",
    fontSize: 14,
    fontFamily: "DM Sans, sans-serif",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    transition: "border-color 0.2s, box-shadow 0.2s"
};
const labelStyle = {
    fontSize: 11,
    fontWeight: 600,
    color: "#64748b",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    display: "block"
};
function SearchFilters({ onSearch }) {
    _s();
    const [filters, setFilters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        specialization: "",
        hospital: "",
        date: "",
        doctorName: ""
    });
    const [showCal, setShowCal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const calRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SearchFilters.useEffect": ()=>{
            function handleClick(e) {
                if (calRef.current && !calRef.current.contains(e.target)) setShowCal(false);
            }
            document.addEventListener("mousedown", handleClick);
            return ({
                "SearchFilters.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["SearchFilters.useEffect"];
        }
    }["SearchFilters.useEffect"], []);
    const set = (key, value)=>setFilters((f)=>({
                ...f,
                [key]: value
            }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "glass animate-fade-up-2",
        style: {
            padding: 28
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#38bdf8",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 22
                },
                children: "✦ Search Filters"
            }, void 0, false, {
                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: labelStyle,
                                children: "Specialization"
                            }, void 0, false, {
                                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: "relative"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: filters.specialization,
                                        onChange: (e)=>set("specialization", e.target.value),
                                        style: selectStyle,
                                        onFocus: (e)=>{
                                            e.target.style.borderColor = "rgba(14,165,233,0.5)";
                                            e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.1)";
                                        },
                                        onBlur: (e)=>{
                                            e.target.style.borderColor = "rgba(56,189,248,0.15)";
                                            e.target.style.boxShadow = "none";
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                style: {
                                                    background: "#0f172a"
                                                },
                                                children: "All Specializations"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                                lineNumber: 85,
                                                columnNumber: 15
                                            }, this),
                                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SPECIALIZATIONS"].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: s,
                                                    style: {
                                                        background: "#0f172a"
                                                    },
                                                    children: s
                                                }, s, false, {
                                                    fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                                    lineNumber: 87,
                                                    columnNumber: 17
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                        lineNumber: 72,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            position: "absolute",
                                            right: 12,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "#475569",
                                            pointerEvents: "none",
                                            fontSize: 10
                                        },
                                        children: "▼"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                        lineNumber: 90,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                lineNumber: 71,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: labelStyle,
                                children: "Hospital"
                            }, void 0, false, {
                                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                lineNumber: 96,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: "relative"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: filters.hospital,
                                        onChange: (e)=>set("hospital", e.target.value),
                                        style: selectStyle,
                                        onFocus: (e)=>{
                                            e.target.style.borderColor = "rgba(14,165,233,0.5)";
                                            e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.1)";
                                        },
                                        onBlur: (e)=>{
                                            e.target.style.borderColor = "rgba(56,189,248,0.15)";
                                            e.target.style.boxShadow = "none";
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                style: {
                                                    background: "#0f172a"
                                                },
                                                children: "All Hospitals"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                                lineNumber: 111,
                                                columnNumber: 15
                                            }, this),
                                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HOSPITALS"].map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: h,
                                                    style: {
                                                        background: "#0f172a"
                                                    },
                                                    children: h
                                                }, h, false, {
                                                    fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                                    lineNumber: 113,
                                                    columnNumber: 17
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                        lineNumber: 98,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            position: "absolute",
                                            right: 12,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "#475569",
                                            pointerEvents: "none",
                                            fontSize: 10
                                        },
                                        children: "▼"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                        lineNumber: 116,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                lineNumber: 97,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                        lineNumber: 95,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 16,
                    position: "relative"
                },
                ref: calRef,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        style: labelStyle,
                        children: "Preferred Date"
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                        lineNumber: 123,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowCal((v)=>!v),
                        style: {
                            ...selectStyle,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            textAlign: "left",
                            cursor: "pointer"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: filters.date ? "#f1f5f9" : "#475569"
                                },
                                children: filters.date ? `📅  ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDate"])(filters.date)}` : "📅  Select a date"
                            }, void 0, false, {
                                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                lineNumber: 135,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: "#475569",
                                    fontSize: 10
                                },
                                children: showCal ? "▲" : "▼"
                            }, void 0, false, {
                                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                lineNumber: 138,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this),
                    showCal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: "absolute",
                            zIndex: 100,
                            top: "calc(100% + 8px)",
                            left: 0
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Calendar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            selected: filters.date,
                            onSelect: (d)=>{
                                set("date", d);
                                setShowCal(false);
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                            lineNumber: 142,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                        lineNumber: 141,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 24
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        style: labelStyle,
                        children: "Doctor Name"
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                        lineNumber: 149,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "e.g. Dr. Perera...",
                        value: filters.doctorName,
                        onChange: (e)=>set("doctorName", e.target.value),
                        onKeyDown: (e)=>e.key === "Enter" && onSearch(filters),
                        className: "input-glow"
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                        lineNumber: 150,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                lineNumber: 148,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                size: "lg",
                style: {
                    width: "100%"
                },
                onClick: ()=>onSearch(filters),
                children: "Search Doctors →"
            }, void 0, false, {
                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/doctors/SearchFilters.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
_s(SearchFilters, "Z2LIwbcAR03/dHjO207+VFiPefw=");
_c = SearchFilters;
var _c;
__turbopack_context__.k.register(_c, "SearchFilters");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/Badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Badge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const styles = {
    blue: {
        background: "rgba(14,165,233,0.12)",
        color: "#38bdf8",
        border: "1px solid rgba(56,189,248,0.2)"
    },
    green: {
        background: "rgba(34,197,94,0.1)",
        color: "#4ade80",
        border: "1px solid rgba(74,222,128,0.2)"
    },
    red: {
        background: "rgba(239,68,68,0.1)",
        color: "#f87171",
        border: "1px solid rgba(248,113,113,0.2)"
    },
    yellow: {
        background: "rgba(234,179,8,0.1)",
        color: "#facc15",
        border: "1px solid rgba(250,204,21,0.2)"
    },
    purple: {
        background: "rgba(139,92,246,0.12)",
        color: "#a78bfa",
        border: "1px solid rgba(167,139,250,0.2)"
    },
    slate: {
        background: "rgba(51,65,85,0.5)",
        color: "#94a3b8",
        border: "1px solid rgba(71,85,105,0.4)"
    }
};
function Badge({ children, variant = "blue" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: {
            ...styles[variant],
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 10px",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.3,
            whiteSpace: "nowrap"
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Badge.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_c = Badge;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/doctors/DoctorCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DoctorCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Button.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function DoctorCard({ doctor, onChannel }) {
    _s();
    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "glass glass-hover animate-fade-up",
        onMouseEnter: ()=>setHovered(true),
        onMouseLeave: ()=>setHovered(false),
        style: {
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 18
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "relative",
                    flexShrink: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: 52,
                            height: 52,
                            borderRadius: 16,
                            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: 16,
                            fontFamily: "Syne, sans-serif",
                            boxShadow: hovered ? "0 0 24px rgba(14,165,233,0.5)" : "0 0 12px rgba(14,165,233,0.25)",
                            transition: "box-shadow 0.3s"
                        },
                        children: doctor.initials
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/DoctorCard.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    doctor.available && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: "absolute",
                            bottom: -2,
                            right: -2,
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: "#22c55e",
                            border: "2px solid #020818",
                            boxShadow: "0 0 8px rgba(34,197,94,0.6)"
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/DoctorCard.tsx",
                        lineNumber: 52,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/doctors/DoctorCard.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    minWidth: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontFamily: "Syne, sans-serif",
                            fontWeight: 700,
                            color: "#f1f5f9",
                            fontSize: 15,
                            marginBottom: 8,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        },
                        children: doctor.name
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/DoctorCard.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                variant: "blue",
                                children: doctor.specialization
                            }, void 0, false, {
                                fileName: "[project]/src/components/doctors/DoctorCard.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                variant: "slate",
                                children: doctor.hospital
                            }, void 0, false, {
                                fileName: "[project]/src/components/doctors/DoctorCard.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            doctor.available ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                variant: "green",
                                children: "● Available"
                            }, void 0, false, {
                                fileName: "[project]/src/components/doctors/DoctorCard.tsx",
                                lineNumber: 86,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                variant: "red",
                                children: "● Fully Booked"
                            }, void 0, false, {
                                fileName: "[project]/src/components/doctors/DoctorCard.tsx",
                                lineNumber: 87,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/doctors/DoctorCard.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/doctors/DoctorCard.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    textAlign: "right",
                    flexShrink: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            color: "#4ade80",
                            fontWeight: 700,
                            fontSize: 16,
                            marginBottom: 10
                        },
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(doctor.fee)
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/DoctorCard.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        variant: doctor.available ? "primary" : "secondary",
                        size: "sm",
                        disabled: !doctor.available,
                        onClick: ()=>doctor.available && onChannel(doctor),
                        children: doctor.available ? "Channel 🩺" : "Unavailable"
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/DoctorCard.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/doctors/DoctorCard.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/doctors/DoctorCard.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_s(DoctorCard, "V8YbV+gTZxGliGj1g0fftBlvsq4=");
_c = DoctorCard;
var _c;
__turbopack_context__.k.register(_c, "DoctorCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/doctors/TimeSlots.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TimeSlots
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Button.tsx [app-client] (ecmascript)");
"use client";
;
;
function TimeSlots({ slots, selected, onSelect, onBook }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "glass animate-fade-up-2",
        style: {
            padding: 28
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#38bdf8",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 20
                },
                children: "⏰ Available Time Slots"
            }, void 0, false, {
                fileName: "[project]/src/components/doctors/TimeSlots.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 10,
                    marginBottom: 24
                },
                children: slots.map((slot, i)=>{
                    const isSelected = selected === slot.time;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: slot.booked,
                        onClick: ()=>!slot.booked && onSelect(slot.time),
                        style: {
                            padding: "10px 6px",
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: "DM Sans, sans-serif",
                            cursor: slot.booked ? "not-allowed" : "pointer",
                            border: isSelected ? "1px solid rgba(14,165,233,0.7)" : slot.booked ? "1px solid rgba(30,41,59,0.5)" : "1px solid rgba(56,189,248,0.1)",
                            background: isSelected ? "linear-gradient(135deg, rgba(14,165,233,0.25), rgba(56,189,248,0.15))" : slot.booked ? "rgba(15,23,42,0.3)" : "rgba(14,28,54,0.5)",
                            color: isSelected ? "#38bdf8" : slot.booked ? "#1e293b" : "#94a3b8",
                            textDecoration: slot.booked ? "line-through" : "none",
                            boxShadow: isSelected ? "0 0 16px rgba(14,165,233,0.2)" : "none",
                            transition: "all 0.2s",
                            animationDelay: `${i * 0.03}s`
                        },
                        onMouseEnter: (e)=>{
                            if (!slot.booked && !isSelected) {
                                e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)";
                                e.currentTarget.style.color = "#e2e8f0";
                                e.currentTarget.style.background = "rgba(14,165,233,0.08)";
                            }
                        },
                        onMouseLeave: (e)=>{
                            if (!slot.booked && !isSelected) {
                                e.currentTarget.style.borderColor = "rgba(56,189,248,0.1)";
                                e.currentTarget.style.color = "#94a3b8";
                                e.currentTarget.style.background = "rgba(14,28,54,0.5)";
                            }
                        },
                        children: slot.time
                    }, slot.time, false, {
                        fileName: "[project]/src/components/doctors/TimeSlots.tsx",
                        lineNumber: 23,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/doctors/TimeSlots.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-scale-in",
                style: {
                    background: "linear-gradient(135deg, rgba(14,165,233,0.12), rgba(99,102,241,0.08))",
                    border: "1px solid rgba(14,165,233,0.25)",
                    borderRadius: 14,
                    padding: "18px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 11,
                                    color: "#38bdf8",
                                    fontWeight: 600,
                                    letterSpacing: 1,
                                    textTransform: "uppercase",
                                    marginBottom: 4
                                },
                                children: "Selected"
                            }, void 0, false, {
                                fileName: "[project]/src/components/doctors/TimeSlots.tsx",
                                lineNumber: 89,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontFamily: "Syne, sans-serif",
                                    fontWeight: 700,
                                    color: "#f1f5f9",
                                    fontSize: 20
                                },
                                children: selected
                            }, void 0, false, {
                                fileName: "[project]/src/components/doctors/TimeSlots.tsx",
                                lineNumber: 92,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/doctors/TimeSlots.tsx",
                        lineNumber: 88,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        size: "lg",
                        onClick: onBook,
                        children: "Book Now →"
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/TimeSlots.tsx",
                        lineNumber: 96,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/doctors/TimeSlots.tsx",
                lineNumber: 76,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/doctors/TimeSlots.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = TimeSlots;
var _c;
__turbopack_context__.k.register(_c, "TimeSlots");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/doctors/DoctorDetail.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DoctorDetail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/mockData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$doctors$2f$TimeSlots$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/doctors/TimeSlots.tsx [app-client] (ecmascript)");
;
;
;
;
;
;
function DoctorDetail({ doctor, selectedSlot, onSelectSlot, onBook, onBack }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            flexDirection: "column",
            gap: 20
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                variant: "ghost",
                size: "sm",
                onClick: onBack,
                children: "← Back to Search"
            }, void 0, false, {
                fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "glass animate-fade-up",
                style: {
                    padding: 28,
                    background: "linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(99,102,241,0.05) 100%)",
                    position: "relative",
                    overflow: "hidden"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: "absolute",
                            top: -60,
                            right: -60,
                            width: 200,
                            height: 200,
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(14,165,233,0.1), transparent 70%)",
                            pointerEvents: "none"
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            gap: 22,
                            alignItems: "flex-start",
                            position: "relative"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: 68,
                                    height: 68,
                                    borderRadius: 20,
                                    background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontWeight: 800,
                                    fontSize: 22,
                                    fontFamily: "Syne, sans-serif",
                                    flexShrink: 0,
                                    boxShadow: "0 0 32px rgba(14,165,233,0.4)"
                                },
                                children: doctor.initials
                            }, void 0, false, {
                                fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                lineNumber: 46,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    minWidth: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        style: {
                                            fontFamily: "Syne, sans-serif",
                                            fontWeight: 800,
                                            fontSize: 22,
                                            color: "#f1f5f9",
                                            marginBottom: 10
                                        },
                                        children: doctor.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                        lineNumber: 67,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 8,
                                            marginBottom: 10
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                variant: "blue",
                                                children: doctor.specialization
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                                lineNumber: 77,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                variant: "purple",
                                                children: doctor.hospital
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                                lineNumber: 78,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                variant: "green",
                                                children: "● Available Today"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                                lineNumber: 79,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                        lineNumber: 76,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            color: "#64748b",
                                            fontSize: 13
                                        },
                                        children: [
                                            doctor.qualifications,
                                            " · ",
                                            doctor.experience,
                                            " · ",
                                            doctor.languages.join(", ")
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                        lineNumber: 81,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    textAlign: "right",
                                    flexShrink: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            color: "#64748b",
                                            fontSize: 11,
                                            marginBottom: 4
                                        },
                                        children: "Consultation Fee"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                        lineNumber: 87,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontFamily: "Syne, sans-serif",
                                            fontWeight: 800,
                                            fontSize: 26,
                                            background: "linear-gradient(135deg, #4ade80, #22c55e)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text"
                                        },
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(doctor.fee)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                        lineNumber: 88,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                lineNumber: 86,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$doctors$2f$TimeSlots$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                slots: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TIME_SLOTS"],
                selected: selectedSlot,
                onSelect: onSelectSlot,
                onBook: onBook
            }, void 0, false, {
                fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, this),
            doctor.otherHospitals.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "glass animate-fade-up-3",
                style: {
                    padding: 28
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#facc15",
                            letterSpacing: 2,
                            textTransform: "uppercase",
                            marginBottom: 18
                        },
                        children: "🏥 Also Visits Other Hospitals"
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                        lineNumber: 114,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 10
                        },
                        children: doctor.otherHospitals.map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: "rgba(14,28,54,0.5)",
                                    borderRadius: 12,
                                    padding: "14px 18px",
                                    border: "1px solid rgba(56,189,248,0.08)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontWeight: 600,
                                                    color: "#e2e8f0",
                                                    fontSize: 14,
                                                    marginBottom: 3
                                                },
                                                children: h.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                                lineNumber: 132,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    color: "#64748b",
                                                    fontSize: 12
                                                },
                                                children: [
                                                    h.days,
                                                    " · ",
                                                    h.hours
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                                lineNumber: 133,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                        lineNumber: 131,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        variant: "yellow",
                                        children: "Other Location"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                        lineNumber: 135,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, h.name, true, {
                                fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                                lineNumber: 119,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                        lineNumber: 117,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
                lineNumber: 113,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/doctors/DoctorDetail.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_c = DoctorDetail;
var _c;
__turbopack_context__.k.register(_c, "DoctorDetail");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/booking/BookingForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BookingForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Button.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function Field({ label, required, error, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            flexDirection: "column",
            gap: 6
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                style: {
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#64748b",
                    letterSpacing: 1,
                    textTransform: "uppercase"
                },
                children: [
                    label,
                    required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: "#f87171",
                            marginLeft: 3
                        },
                        children: "*"
                    }, void 0, false, {
                        fileName: "[project]/src/components/booking/BookingForm.tsx",
                        lineNumber: 21,
                        columnNumber: 29
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/booking/BookingForm.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            children,
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "#f87171",
                    fontSize: 12
                },
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/booking/BookingForm.tsx",
                lineNumber: 24,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/booking/BookingForm.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_c = Field;
const inputStyle = {
    width: "100%",
    background: "rgba(14, 28, 54, 0.8)",
    border: "1px solid rgba(56, 189, 248, 0.15)",
    borderRadius: 12,
    padding: "11px 16px",
    color: "#f1f5f9",
    fontSize: 14,
    fontFamily: "DM Sans, sans-serif",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box"
};
function BookingForm({ doctor, slot, onBack }) {
    _s();
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        fullName: "",
        idType: "nic",
        nic: "",
        passport: "",
        email: "",
        phone: "",
        address: "",
        notes: ""
    });
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [confirmed, setConfirmed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [appointmentId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateAppointmentId"])());
    const set = (key, value)=>setForm((f)=>({
                ...f,
                [key]: value
            }));
    const focusInput = (e)=>{
        e.target.style.borderColor = "rgba(14,165,233,0.5)";
        e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.1)";
    };
    const blurInput = (e)=>{
        e.target.style.borderColor = "rgba(56,189,248,0.15)";
        e.target.style.boxShadow = "none";
    };
    const validate = ()=>{
        const e = {};
        if (!form.fullName.trim()) e.fullName = "Full name is required";
        if (form.idType === "nic" && !form.nic.trim()) e.nic = "NIC number is required";
        if (form.idType === "passport" && !form.passport.trim()) e.passport = "Passport number is required";
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
        if (!form.phone.trim()) e.phone = "Phone number is required";
        if (!form.address.trim()) e.address = "Address is required";
        return e;
    };
    const handleSubmit = async ()=>{
        const e = validate();
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
        setLoading(true);
        await new Promise((r)=>setTimeout(r, 1400));
        setLoading(false);
        setConfirmed(true);
    };
    const totalFee = doctor.fee + doctor.serviceFee;
    /* ── Confirmation ── */ if (confirmed) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "animate-scale-in",
            style: {
                textAlign: "center",
                padding: "48px 24px"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(74,222,128,0.1))",
                        border: "1px solid rgba(74,222,128,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 36,
                        margin: "0 auto 24px",
                        boxShadow: "0 0 40px rgba(34,197,94,0.2)"
                    },
                    children: "✓"
                }, void 0, false, {
                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                    lineNumber: 91,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    style: {
                        fontFamily: "Syne, sans-serif",
                        fontWeight: 800,
                        fontSize: 26,
                        color: "#4ade80",
                        marginBottom: 8
                    },
                    children: "Appointment Confirmed!"
                }, void 0, false, {
                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                    lineNumber: 107,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#64748b",
                        marginBottom: 4,
                        fontSize: 14
                    },
                    children: [
                        "Booking ID: ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                color: "#38bdf8",
                                fontFamily: "monospace",
                                fontWeight: 700
                            },
                            children: appointmentId
                        }, void 0, false, {
                            fileName: "[project]/src/components/booking/BookingForm.tsx",
                            lineNumber: 111,
                            columnNumber: 23
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                    lineNumber: 110,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#64748b",
                        marginBottom: 32,
                        fontSize: 14
                    },
                    children: [
                        "Receipt sent to ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                color: "#f1f5f9",
                                fontWeight: 600
                            },
                            children: form.email
                        }, void 0, false, {
                            fileName: "[project]/src/components/booking/BookingForm.tsx",
                            lineNumber: 114,
                            columnNumber: 27
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "glass",
                    style: {
                        padding: 24,
                        maxWidth: 380,
                        margin: "0 auto 24px",
                        textAlign: "left"
                    },
                    children: [
                        [
                            "Doctor",
                            doctor.name
                        ],
                        [
                            "Specialization",
                            doctor.specialization
                        ],
                        [
                            "Hospital",
                            doctor.hospital
                        ],
                        [
                            "Time Slot",
                            slot
                        ],
                        [
                            "Patient",
                            form.fullName
                        ],
                        [
                            form.idType === "nic" ? "NIC" : "Passport",
                            form.idType === "nic" ? form.nic : form.passport
                        ],
                        [
                            "Consultation Fee",
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(doctor.fee)
                        ],
                        [
                            "Service Charge",
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(doctor.serviceFee)
                        ],
                        [
                            "Total",
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(totalFee)
                        ]
                    ].map(([label, value], i, arr)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "10px 0",
                                borderBottom: i < arr.length - 1 ? "1px solid rgba(56,189,248,0.07)" : "none"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: "#475569",
                                        fontSize: 13
                                    },
                                    children: label
                                }, void 0, false, {
                                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                                    lineNumber: 136,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: label === "Total" ? "#4ade80" : "#f1f5f9"
                                    },
                                    children: value
                                }, void 0, false, {
                                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                                    lineNumber: 137,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, label, true, {
                            fileName: "[project]/src/components/booking/BookingForm.tsx",
                            lineNumber: 130,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                    lineNumber: 118,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: "rgba(14,165,233,0.08)",
                        border: "1px solid rgba(56,189,248,0.15)",
                        borderRadius: 12,
                        padding: "14px 20px",
                        maxWidth: 380,
                        margin: "0 auto",
                        fontSize: 13,
                        color: "#38bdf8"
                    },
                    children: [
                        "📲 WhatsApp confirmation sent to ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: form.phone
                        }, void 0, false, {
                            fileName: "[project]/src/components/booking/BookingForm.tsx",
                            lineNumber: 156,
                            columnNumber: 44
                        }, this),
                        ". Please arrive 10 mins early."
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                    lineNumber: 146,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/booking/BookingForm.tsx",
            lineNumber: 90,
            columnNumber: 7
        }, this);
    }
    /* ── Form ── */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                variant: "ghost",
                size: "sm",
                onClick: onBack,
                style: {
                    marginBottom: 20
                },
                children: "← Back to Time Slots"
            }, void 0, false, {
                fileName: "[project]/src/components/booking/BookingForm.tsx",
                lineNumber: 165,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "glass animate-fade-up",
                style: {
                    padding: "16px 22px",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    background: "linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.05))"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: 14,
                            fontFamily: "Syne, sans-serif",
                            flexShrink: 0,
                            boxShadow: "0 0 16px rgba(14,165,233,0.3)"
                        },
                        children: doctor.initials
                    }, void 0, false, {
                        fileName: "[project]/src/components/booking/BookingForm.tsx",
                        lineNumber: 178,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            minWidth: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontWeight: 700,
                                    color: "#f1f5f9",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                },
                                children: doctor.name
                            }, void 0, false, {
                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                lineNumber: 196,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: "#64748b",
                                    fontSize: 13
                                },
                                children: [
                                    doctor.hospital,
                                    " · ",
                                    slot
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                lineNumber: 199,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/booking/BookingForm.tsx",
                        lineNumber: 195,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontFamily: "Syne, sans-serif",
                            fontWeight: 800,
                            fontSize: 18,
                            color: "#4ade80",
                            flexShrink: 0
                        },
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(doctor.fee)
                    }, void 0, false, {
                        fileName: "[project]/src/components/booking/BookingForm.tsx",
                        lineNumber: 201,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/booking/BookingForm.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "glass animate-fade-up-2",
                style: {
                    padding: 28
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#38bdf8",
                            letterSpacing: 2,
                            textTransform: "uppercase",
                            marginBottom: 24
                        },
                        children: "📋 Patient Details"
                    }, void 0, false, {
                        fileName: "[project]/src/components/booking/BookingForm.tsx",
                        lineNumber: 207,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 18
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: "Full Name",
                                required: true,
                                error: errors.fullName,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "As per NIC / Passport",
                                    value: form.fullName,
                                    onChange: (e)=>set("fullName", e.target.value),
                                    style: inputStyle,
                                    onFocus: focusInput,
                                    onBlur: blurInput
                                }, void 0, false, {
                                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                                    lineNumber: 213,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                lineNumber: 212,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: "#64748b",
                                            letterSpacing: 1,
                                            textTransform: "uppercase",
                                            display: "block",
                                            marginBottom: 8
                                        },
                                        children: [
                                            "ID Type ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: "#f87171"
                                                },
                                                children: "*"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                                lineNumber: 221,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/booking/BookingForm.tsx",
                                        lineNumber: 220,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            gap: 10
                                        },
                                        children: [
                                            "nic",
                                            "passport"
                                        ].map((type)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>set("idType", type),
                                                style: {
                                                    flex: 1,
                                                    padding: "10px",
                                                    borderRadius: 12,
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    fontFamily: "DM Sans, sans-serif",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s",
                                                    border: form.idType === type ? "1px solid rgba(14,165,233,0.6)" : "1px solid rgba(56,189,248,0.1)",
                                                    background: form.idType === type ? "linear-gradient(135deg, rgba(14,165,233,0.2), rgba(56,189,248,0.1))" : "rgba(14,28,54,0.5)",
                                                    color: form.idType === type ? "#38bdf8" : "#64748b",
                                                    boxShadow: form.idType === type ? "0 0 16px rgba(14,165,233,0.15)" : "none"
                                                },
                                                children: type === "nic" ? "NIC" : "Passport"
                                            }, type, false, {
                                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                                lineNumber: 225,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/booking/BookingForm.tsx",
                                        lineNumber: 223,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                lineNumber: 219,
                                columnNumber: 11
                            }, this),
                            form.idType === "nic" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: "NIC Number",
                                required: true,
                                error: errors.nic,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "e.g. 199012345678 or 901234567V",
                                    value: form.nic,
                                    onChange: (e)=>set("nic", e.target.value),
                                    style: inputStyle,
                                    onFocus: focusInput,
                                    onBlur: blurInput
                                }, void 0, false, {
                                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                                    lineNumber: 255,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                lineNumber: 254,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: "Passport Number",
                                required: true,
                                error: errors.passport,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "e.g. N1234567",
                                    value: form.passport,
                                    onChange: (e)=>set("passport", e.target.value),
                                    style: inputStyle,
                                    onFocus: focusInput,
                                    onBlur: blurInput
                                }, void 0, false, {
                                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                                    lineNumber: 261,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                lineNumber: 260,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                        label: "Email",
                                        required: true,
                                        error: errors.email,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "email",
                                            placeholder: "you@example.com",
                                            value: form.email,
                                            onChange: (e)=>set("email", e.target.value),
                                            style: inputStyle,
                                            onFocus: focusInput,
                                            onBlur: blurInput
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/booking/BookingForm.tsx",
                                            lineNumber: 269,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/booking/BookingForm.tsx",
                                        lineNumber: 268,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                        label: "Phone",
                                        required: true,
                                        error: errors.phone,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "tel",
                                            placeholder: "+94 77 123 4567",
                                            value: form.phone,
                                            onChange: (e)=>set("phone", e.target.value),
                                            style: inputStyle,
                                            onFocus: focusInput,
                                            onBlur: blurInput
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/booking/BookingForm.tsx",
                                            lineNumber: 274,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/booking/BookingForm.tsx",
                                        lineNumber: 273,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                lineNumber: 267,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: "Address",
                                required: true,
                                error: errors.address,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "No. 12, Galle Rd, Colombo 03",
                                    value: form.address,
                                    onChange: (e)=>set("address", e.target.value),
                                    style: inputStyle,
                                    onFocus: focusInput,
                                    onBlur: blurInput
                                }, void 0, false, {
                                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                                    lineNumber: 281,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                lineNumber: 280,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: "Notes for Doctor (Optional)",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    placeholder: "Any symptoms, allergies, or notes...",
                                    value: form.notes,
                                    onChange: (e)=>set("notes", e.target.value),
                                    rows: 3,
                                    style: {
                                        ...inputStyle,
                                        resize: "none"
                                    },
                                    onFocus: focusInput,
                                    onBlur: blurInput
                                }, void 0, false, {
                                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                                    lineNumber: 287,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                lineNumber: 286,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: "rgba(14,28,54,0.6)",
                                    borderRadius: 14,
                                    padding: "18px 20px",
                                    border: "1px solid rgba(56,189,248,0.08)"
                                },
                                children: [
                                    [
                                        [
                                            "Consultation Fee",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(doctor.fee)
                                        ],
                                        [
                                            "Service Charge",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(doctor.serviceFee)
                                        ]
                                    ].map(([label, value])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginBottom: 10,
                                                fontSize: 14
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        color: "#64748b"
                                                    },
                                                    children: label
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                                                    lineNumber: 310,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        color: "#e2e8f0"
                                                    },
                                                    children: value
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/booking/BookingForm.tsx",
                                                    lineNumber: 311,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, label, true, {
                                            fileName: "[project]/src/components/booking/BookingForm.tsx",
                                            lineNumber: 309,
                                            columnNumber: 15
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            height: 1,
                                            background: "rgba(56,189,248,0.1)",
                                            marginBottom: 10
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/booking/BookingForm.tsx",
                                        lineNumber: 314,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            justifyContent: "space-between"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: 700,
                                                    color: "#f1f5f9",
                                                    fontSize: 15
                                                },
                                                children: "Total"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                                lineNumber: 316,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontFamily: "Syne, sans-serif",
                                                    fontWeight: 800,
                                                    fontSize: 18,
                                                    background: "linear-gradient(135deg, #4ade80, #22c55e)",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                    backgroundClip: "text"
                                                },
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(totalFee)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                                lineNumber: 317,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/booking/BookingForm.tsx",
                                        lineNumber: 315,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                lineNumber: 299,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: "#475569",
                                    fontSize: 12,
                                    textAlign: "center"
                                },
                                children: "📧 Receipt emailed · 📲 WhatsApp confirmation sent to your phone"
                            }, void 0, false, {
                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                lineNumber: 331,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                size: "lg",
                                style: {
                                    width: "100%"
                                },
                                onClick: handleSubmit,
                                disabled: loading,
                                children: loading ? "Confirming..." : "Confirm Appointment & Pay →"
                            }, void 0, false, {
                                fileName: "[project]/src/components/booking/BookingForm.tsx",
                                lineNumber: 335,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/booking/BookingForm.tsx",
                        lineNumber: 211,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/booking/BookingForm.tsx",
                lineNumber: 206,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/booking/BookingForm.tsx",
        lineNumber: 164,
        columnNumber: 5
    }, this);
}
_s(BookingForm, "qJMCCJwyrGjA8+SJqQmPCLsFr9E=");
_c1 = BookingForm;
var _c, _c1;
__turbopack_context__.k.register(_c, "Field");
__turbopack_context__.k.register(_c1, "BookingForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/channel/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChannelPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/mockData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$doctors$2f$SearchFilters$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/doctors/SearchFilters.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$doctors$2f$DoctorCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/doctors/DoctorCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$doctors$2f$DoctorDetail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/doctors/DoctorDetail.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$booking$2f$BookingForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/booking/BookingForm.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const STEP_LABELS = [
    {
        key: "search",
        label: "Search"
    },
    {
        key: "detail",
        label: "Select Time"
    },
    {
        key: "book",
        label: "Patient Details"
    }
];
function ChannelPage() {
    _s();
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("search");
    const [results, setResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [searched, setSearched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedDoctor, setSelectedDoctor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedSlot, setSelectedSlot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const handleSearch = (filters)=>{
        let list = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DOCTORS"]
        ];
        if (filters.specialization) list = list.filter((d)=>d.specialization === filters.specialization);
        if (filters.hospital) list = list.filter((d)=>d.hospital === filters.hospital);
        if (filters.doctorName) list = list.filter((d)=>d.name.toLowerCase().includes(filters.doctorName.toLowerCase()));
        setResults(list);
        setSearched(true);
    };
    const handleChannel = (doctor)=>{
        setSelectedDoctor(doctor);
        setSelectedSlot("");
        setStep("detail");
    };
    const currentStepIndex = STEP_LABELS.findIndex((s)=>s.key === step);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-3xl mx-auto px-4 py-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 mb-8",
                children: STEP_LABELS.map((s, i)=>{
                    const done = i < currentStepIndex;
                    const active = s.key === step;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `w-6 h-6 rounded-full flex items-center justify-center
                            text-xs font-bold transition-colors
                  ${active ? "bg-blue-600 text-white ring-2 ring-blue-400/40" : ""}
                  ${done ? "bg-blue-800 text-blue-300" : ""}
                  ${!active && !done ? "bg-slate-800 text-slate-500" : ""}
                `,
                                children: done ? "✓" : i + 1
                            }, void 0, false, {
                                fileName: "[project]/src/app/channel/page.tsx",
                                lineNumber: 57,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `text-xs font-semibold ${active ? "text-blue-400" : "text-slate-500"}`,
                                children: s.label
                            }, void 0, false, {
                                fileName: "[project]/src/app/channel/page.tsx",
                                lineNumber: 67,
                                columnNumber: 15
                            }, this),
                            i < STEP_LABELS.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-slate-700 mx-1",
                                children: "›"
                            }, void 0, false, {
                                fileName: "[project]/src/app/channel/page.tsx",
                                lineNumber: 73,
                                columnNumber: 17
                            }, this)
                        ]
                    }, s.key, true, {
                        fileName: "[project]/src/app/channel/page.tsx",
                        lineNumber: 56,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/channel/page.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            step === "search" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card p-6 bg-gradient-to-br from-blue-950/80 to-slate-900",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-bold text-blue-400 uppercase tracking-widest mb-2",
                                children: "HealixPharm"
                            }, void 0, false, {
                                fileName: "[project]/src/app/channel/page.tsx",
                                lineNumber: 84,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-extrabold text-white mb-1",
                                children: "Book a Doctor Appointment"
                            }, void 0, false, {
                                fileName: "[project]/src/app/channel/page.tsx",
                                lineNumber: 87,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-slate-400 text-sm",
                                children: "Search by specialization, date, name or hospital. Instant WhatsApp confirmation."
                            }, void 0, false, {
                                fileName: "[project]/src/app/channel/page.tsx",
                                lineNumber: 90,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/channel/page.tsx",
                        lineNumber: 83,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$doctors$2f$SearchFilters$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        onSearch: handleSearch
                    }, void 0, false, {
                        fileName: "[project]/src/app/channel/page.tsx",
                        lineNumber: 95,
                        columnNumber: 11
                    }, this),
                    searched && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-slate-500 mb-3",
                                children: results.length > 0 ? `${results.length} doctor(s) found` : "No doctors found — try adjusting your filters"
                            }, void 0, false, {
                                fileName: "[project]/src/app/channel/page.tsx",
                                lineNumber: 99,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: results.map((doc)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$doctors$2f$DoctorCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        doctor: doc,
                                        onChannel: handleChannel
                                    }, doc.id, false, {
                                        fileName: "[project]/src/app/channel/page.tsx",
                                        lineNumber: 106,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/channel/page.tsx",
                                lineNumber: 104,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/channel/page.tsx",
                        lineNumber: 98,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/channel/page.tsx",
                lineNumber: 82,
                columnNumber: 9
            }, this),
            step === "detail" && selectedDoctor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$doctors$2f$DoctorDetail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                doctor: selectedDoctor,
                selectedSlot: selectedSlot,
                onSelectSlot: setSelectedSlot,
                onBook: ()=>setStep("book"),
                onBack: ()=>{
                    setStep("search");
                    setSelectedSlot("");
                }
            }, void 0, false, {
                fileName: "[project]/src/app/channel/page.tsx",
                lineNumber: 116,
                columnNumber: 9
            }, this),
            step === "book" && selectedDoctor && selectedSlot && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$booking$2f$BookingForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                doctor: selectedDoctor,
                slot: selectedSlot,
                onBack: ()=>setStep("detail")
            }, void 0, false, {
                fileName: "[project]/src/app/channel/page.tsx",
                lineNumber: 127,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/channel/page.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
_s(ChannelPage, "73JUCuptq7O5mGOMtcyIH21KMtc=");
_c = ChannelPage;
var _c;
__turbopack_context__.k.register(_c, "ChannelPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_6d8c350a._.js.map