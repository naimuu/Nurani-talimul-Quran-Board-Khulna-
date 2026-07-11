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
"[project]/src/app/api/seed-locations/route.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "GET": ()=>GET
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$Location$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/lib/models/Location.ts [app-route] (ecmascript)");
var __TURBOPACK__commonjs__external__mongoose__ = __turbopack_external_require__("mongoose", true);
"__TURBOPACK__ecmascript__hoisting__location__";
;
;
;
;
async function GET() {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        // Clear existing
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$Location$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].deleteMany({});
        // Fetch Data
        const dRes = await fetch('https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/districts/districts.json');
        const dJson = await dRes.json();
        const districtData = dJson[2].data; // Wait, let's verify index!
        const uRes = await fetch('https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/upazilas/upazilas.json');
        const uJson = await uRes.json();
        const upazilaData = uJson[2].data;
        const unRes = await fetch('https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/unions/unions.json');
        const unJson = await unRes.json();
        const unionData = unJson[2].data;
        const districtIdMap = new Map();
        const upazilaIdMap = new Map();
        // Insert Districts
        for (const d of districtData){
            const loc = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$Location$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].create({
                name: d.name,
                bn_name: d.bn_name,
                type: 'DISTRICT',
                parentId: null
            });
            districtIdMap.set(d.id, loc._id);
        }
        // Insert Upazilas
        const upazilaBatch = [];
        for (const u of upazilaData){
            const parentId = districtIdMap.get(u.district_id);
            if (!parentId) continue;
            const locId = new __TURBOPACK__commonjs__external__mongoose__["default"].Types.ObjectId();
            upazilaIdMap.set(u.id, locId);
            upazilaBatch.push({
                _id: locId,
                name: u.name,
                bn_name: u.bn_name,
                type: 'UPAZILA',
                parentId: parentId
            });
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$Location$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].insertMany(upazilaBatch);
        // Insert Unions
        const unionBatch = [];
        for (const u of unionData){
            const parentId = upazilaIdMap.get(u.upazilla_id); // notice the spelling upazilla_id
            if (!parentId) continue;
            unionBatch.push({
                name: u.name,
                bn_name: u.bn_name,
                type: 'UNION',
                parentId: parentId
            });
        }
        // Batch insert unions in chunks of 1000 to prevent timeout/size errors
        const chunkSize = 1000;
        for(let i = 0; i < unionBatch.length; i += chunkSize){
            const chunk = unionBatch.slice(i, i + chunkSize);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$Location$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].insertMany(chunk);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: `Seeded ${districtData.length} districts, ${upazilaBatch.length} upazilas, ${unionBatch.length} unions.`
        });
    } catch (error) {
        console.error("Seeding error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.toString(),
            stack: error.stack
        }, {
            status: 500
        });
    }
}

})()),

};

//# sourceMappingURL=src_441497._.js.map