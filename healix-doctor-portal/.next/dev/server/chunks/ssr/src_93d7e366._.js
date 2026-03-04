module.exports = [
"[project]/src/data/mockData.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/components/ui/Calendar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Calendar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
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
    const today = new Date();
    const [month, setMonth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(today.getMonth());
    const [year, setYear] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(today.getFullYear());
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    marginBottom: 8
                },
                children: DAY_NAMES.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 3
                },
                children: cells.map((day, i)=>{
                    if (!day) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, i, false, {
                        fileName: "[project]/src/components/ui/Calendar.tsx",
                        lineNumber: 95,
                        columnNumber: 28
                    }, this);
                    const past = isPast(day);
                    const sel = selected === fmt(day);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
}),
"[project]/src/components/ui/Button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
}),
"[project]/src/components/doctors/SearchFilters.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SearchFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/mockData.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Calendar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Calendar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Button.tsx [app-ssr] (ecmascript)");
"use client";
;
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
    const [filters, setFilters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        specialization: "",
        hospital: "",
        date: "",
        doctorName: ""
    });
    const [showCal, setShowCal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const calRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleClick(e) {
            if (calRef.current && !calRef.current.contains(e.target)) setShowCal(false);
        }
        document.addEventListener("mousedown", handleClick);
        return ()=>document.removeEventListener("mousedown", handleClick);
    }, []);
    const set = (key, value)=>setFilters((f)=>({
                ...f,
                [key]: value
            }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "glass animate-fade-up-2",
        style: {
            padding: 28
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: labelStyle,
                                children: "Specialization"
                            }, void 0, false, {
                                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: "relative"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
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
                                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SPECIALIZATIONS"].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: labelStyle,
                                children: "Hospital"
                            }, void 0, false, {
                                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                lineNumber: 96,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: "relative"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
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
                                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HOSPITALS"].map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 16,
                    position: "relative"
                },
                ref: calRef,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        style: labelStyle,
                        children: "Preferred Date"
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                        lineNumber: 123,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: filters.date ? "#f1f5f9" : "#475569"
                                },
                                children: filters.date ? `📅  ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDate"])(filters.date)}` : "  Select a date"
                            }, void 0, false, {
                                fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                                lineNumber: 135,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    showCal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: "absolute",
                            zIndex: 100,
                            top: "calc(100% + 8px)",
                            left: 0
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Calendar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 24
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        style: labelStyle,
                        children: "Doctor Name"
                    }, void 0, false, {
                        fileName: "[project]/src/components/doctors/SearchFilters.tsx",
                        lineNumber: 149,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                size: "lg",
                style: {
                    width: "100%"
                },
                onClick: ()=>onSearch(filters),
                children: "Search Doctors"
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
}),
"[project]/src/app/channel/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChannelPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$doctors$2f$SearchFilters$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/doctors/SearchFilters.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function ChannelPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const handleSearch = (filters)=>{
        const params = new URLSearchParams();
        if (filters.specialization) params.set("spec", filters.specialization);
        if (filters.hospital) params.set("hospital", filters.hospital);
        if (filters.date) params.set("date", filters.date);
        if (filters.doctorName) params.set("name", filters.doctorName);
        router.push(`/channel/results?${params.toString()}`);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            maxWidth: 680,
            margin: "0 auto",
            padding: "60px 24px"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-fade-up",
                style: {
                    textAlign: "center",
                    marginBottom: 48
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "badge-shimmer animate-fade-up",
                        style: {
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 18px",
                            borderRadius: 99,
                            border: "1px solid rgba(56,189,248,0.2)",
                            marginBottom: 24,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#38bdf8",
                            letterSpacing: 0.5
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "#22c55e",
                                    display: "inline-block",
                                    boxShadow: "0 0 6px #22c55e"
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/channel/page.tsx",
                                lineNumber: 30,
                                columnNumber: 11
                            }, this),
                            "Real-time availability"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/channel/page.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "animate-fade-up-1",
                        style: {
                            fontFamily: "Syne, sans-serif",
                            fontWeight: 800,
                            fontSize: "clamp(2rem, 5vw, 3rem)",
                            color: "#f1f5f9",
                            marginBottom: 14
                        },
                        children: [
                            "Book a Doctor",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    background: "linear-gradient(135deg, #38bdf8, #818cf8)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text"
                                },
                                children: "Appointment"
                            }, void 0, false, {
                                fileName: "[project]/src/app/channel/page.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/channel/page.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "animate-fade-up-2",
                        style: {
                            color: "#64748b",
                            fontSize: 15,
                            maxWidth: 420,
                            margin: "0 auto"
                        },
                        children: "Search by specialization, hospital, date or doctor name. Get instant WhatsApp confirmation."
                    }, void 0, false, {
                        fileName: "[project]/src/app/channel/page.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/channel/page.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-fade-up-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$doctors$2f$SearchFilters$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    onSearch: handleSearch
                }, void 0, false, {
                    fileName: "[project]/src/app/channel/page.tsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/channel/page.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/channel/page.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_93d7e366._.js.map