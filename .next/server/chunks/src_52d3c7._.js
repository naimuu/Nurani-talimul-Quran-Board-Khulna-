module.exports = {

"[project]/src/lib/mongodb.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__commonjs__external__mongoose__ = __turbopack_external_require__("mongoose", true);
"__TURBOPACK__ecmascript__hoisting__location__";
;
const MONGODB_URI = process.env.DATABASE_URL;
if (!MONGODB_URI) {
    throw new Error('Please define the DATABASE_URL environment variable');
}
const cached = global.mongoose ?? {
    conn: null,
    promise: null
};
if (!global.mongoose) {
    global.mongoose = cached;
}
async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = __TURBOPACK__commonjs__external__mongoose__["default"].connect(MONGODB_URI, {
            bufferCommands: false
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
const __TURBOPACK__default__export__ = connectDB;

})()),
"[project]/src/lib/models/User.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__commonjs__external__mongoose__ = __turbopack_external_require__("mongoose", true);
"__TURBOPACK__ecmascript__hoisting__location__";
;
const UserSchema = new __TURBOPACK__commonjs__external__mongoose__["Schema"]({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    role: {
        type: String,
        default: 'GENERAL'
    },
    madrasaId: {
        type: __TURBOPACK__commonjs__external__mongoose__["Schema"].Types.ObjectId,
        ref: 'Madrasa'
    }
}, {
    timestamps: true
});
const User = __TURBOPACK__commonjs__external__mongoose__["default"].models.User || __TURBOPACK__commonjs__external__mongoose__["default"].model('User', UserSchema);
const __TURBOPACK__default__export__ = User;

})()),
"[project]/src/app/api/auth/login/route.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "POST": ()=>POST
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/jose/dist/webapi/jwt/sign.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/lib/models/User.ts [app-route] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
;
;
;
;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024");
// Role to panel URL mapping
const ROLE_REDIRECT = {
    ADMIN: "/admin",
    MUHTAMIM: "/madrasa",
    MUALLIM: "/muallim",
    GENERAL: "/",
    TRAINER: "/trainer",
    VISITOR: "/visitor"
};
async function POST(req) {
    try {
        const body = await req.json();
        const { identifier, password } = body;
        // identifier can be email or phone
        if (!identifier || !password) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Email/Phone and Password are required"
            }, {
                status: 400
            });
        }
        // Bangladeshi phone number validation: must be 11 digits starting with 01
        const isPhone = /^01[3-9]\d{8}$/.test(identifier);
        if (!isPhone && identifier.startsWith("0")) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "ফোন নম্বরটি সঠিক নয়। ১১ সংখ্যার বাংলাদেশী নম্বর দিন (যেমন: 01870186441)"
            }, {
                status: 400
            });
        }
        // Master Admin Login (Credentials configured in .env file)
        const adminEmail = process.env.ADMIN_EMAIL || "admin@nuraniboard.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin";
        if (identifier.trim().toLowerCase() === adminEmail.toLowerCase()) {
            if (password.trim() === adminPassword) {
                const token = await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"]({
                    userId: "master_admin",
                    role: "ADMIN",
                    name: "System Admin",
                    email: adminEmail
                }).setProtectedHeader({
                    alg: "HS256"
                }).setIssuedAt().setExpirationTime("7d").sign(JWT_SECRET);
                const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    message: "Login successful (Admin)",
                    role: "ADMIN",
                    name: "System Admin",
                    redirectUrl: "/admin"
                });
                response.cookies.set("auth_token", token, {
                    httpOnly: true,
                    secure: ("TURBOPACK compile-time value", "development") === "production",
                    sameSite: "strict",
                    maxAge: 60 * 60 * 24 * 7,
                    path: "/"
                });
                return response;
            } else {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "পাসওয়ার্ড সঠিক নয়"
                }, {
                    status: 401
                });
            }
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        // Find user by email or phone
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$User$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findOne({
            $or: [
                {
                    email: identifier
                },
                {
                    phone: identifier
                }
            ]
        });
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "এই ইমেইল বা ফোন নম্বর দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি"
            }, {
                status: 404
            });
        }
        // Verify password (support both bcrypt hashes and plain text for manually added dev users)
        let isPasswordValid = false;
        // Check if the stored password looks like a bcrypt hash (starts with $2a$ or $2b$)
        if (user.password && (user.password.startsWith("$2a$") || user.password.startsWith("$2b$"))) {
            isPasswordValid = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, user.password);
        } else {
            // Fallback to plain text comparison if they manually added the user in MongoDB Atlas
            isPasswordValid = password === user.password;
        }
        if (!isPasswordValid) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "পাসওয়ার্ড সঠিক নয়"
            }, {
                status: 401
            });
        }
        // Create JWT token
        const token = await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"]({
            userId: user._id.toString(),
            role: user.role,
            name: user.name,
            email: user.email
        }).setProtectedHeader({
            alg: "HS256"
        }).setIssuedAt().setExpirationTime("7d").sign(JWT_SECRET);
        const redirectUrl = ROLE_REDIRECT[user.role] || "/general";
        // Set cookie and return response
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Login successful",
            role: user.role,
            name: user.name,
            redirectUrl
        });
        response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: ("TURBOPACK compile-time value", "development") === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/"
        });
        return response;
    } catch (error) {
        console.error("Login error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal Server Error"
        }, {
            status: 500
        });
    }
}

})()),

};

//# sourceMappingURL=src_52d3c7._.js.map