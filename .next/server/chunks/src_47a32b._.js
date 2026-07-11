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
"[project]/src/lib/models/Location.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__commonjs__external__mongoose__ = __turbopack_external_require__("mongoose", true);
"__TURBOPACK__ecmascript__hoisting__location__";
;
const LocationSchema = new __TURBOPACK__commonjs__external__mongoose__["default"].Schema({
    name: {
        type: String,
        required: true
    },
    bn_name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [
            "DISTRICT",
            "UPAZILA",
            "UNION",
            "VILLAGE",
            "PARA"
        ],
        required: true
    },
    parentId: {
        type: __TURBOPACK__commonjs__external__mongoose__["default"].Schema.Types.ObjectId,
        ref: "Location",
        default: null
    }
}, {
    timestamps: true
});
// Optimize querying children of a specific location
LocationSchema.index({
    parentId: 1,
    type: 1
});
const Location = __TURBOPACK__commonjs__external__mongoose__["default"].models.Location || __TURBOPACK__commonjs__external__mongoose__["default"].model("Location", LocationSchema);
const __TURBOPACK__default__export__ = Location;

})()),
"[project]/src/app/api/admin/locations/route.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "DELETE": ()=>DELETE,
    "GET": ()=>GET,
    "POST": ()=>POST
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$Location$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/lib/models/Location.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/jose/dist/webapi/jwt/verify.js [app-route] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
;
;
;
;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024");
async function checkAdmin() {
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])().get("auth_token")?.value;
    if (!token) return false;
    try {
        const verified = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, JWT_SECRET);
        if (verified.payload.role !== "ADMIN") return false;
        return true;
    } catch  {
        return false;
    }
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const parentId = searchParams.get('parentId');
        const type = searchParams.get('type');
        const query = {};
        if (parentId !== null) {
            query.parentId = parentId === 'null' ? null : parentId;
        }
        if (type) {
            query.type = type;
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        const locations = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$Location$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find(query).sort({
            name: 1
        }).lean();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            locations
        });
    } catch (error) {
        console.error("Error fetching locations:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch locations"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
    }
    try {
        const body = await request.json();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        // Check if bulk insertion
        if (body.locations && Array.isArray(body.locations)) {
            const { type, parentId } = body;
            if (!type) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing type for bulk insert"
            }, {
                status: 400
            });
            const toInsert = body.locations.map((loc)=>({
                    name: loc.name,
                    bn_name: loc.bn_name,
                    type,
                    parentId: parentId || null
                }));
            const newLocations = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$Location$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].insertMany(toInsert);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: "Locations added",
                locations: newLocations
            }, {
                status: 201
            });
        }
        // Single insertion
        const { name, bn_name, type, parentId } = body;
        if (!name || !bn_name || !type) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing required fields"
            }, {
                status: 400
            });
        }
        const newLocation = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$Location$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].create({
            name,
            bn_name,
            type,
            parentId: parentId || null
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Location added",
            location: newLocation
        }, {
            status: 201
        });
    } catch (error) {
        console.error("Error creating location:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to add location"
        }, {
            status: 500
        });
    }
}
async function DELETE(request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
    }
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "ID required"
            }, {
                status: 400
            });
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        // Recursively deleting children could be complex. For safety, just delete one if it has no children.
        const hasChildren = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$Location$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].exists({
            parentId: id
        });
        if (hasChildren) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Cannot delete location with nested sub-locations"
            }, {
                status: 400
            });
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$Location$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findByIdAndDelete(id);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Location deleted"
        });
    } catch (error) {
        console.error("Error deleting location:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to delete location"
        }, {
            status: 500
        });
    }
}

})()),

};

//# sourceMappingURL=src_47a32b._.js.map