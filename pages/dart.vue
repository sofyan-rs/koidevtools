<template>
    <div class="h-full flex flex-col overflow-hidden">
        <!-- Header -->
        <header
            class="flex items-center justify-between px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0"
        >
            <span
                class="text-base sm:text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100 select-none"
            >
                <UIcon
                    name="i-heroicons-cube"
                    class="w-5 h-5 mr-1 inline-block align-text-bottom"
                />
                JSON to Dart
            </span>

            <!-- Mobile tab toggle -->
            <div
                class="flex items-center md:hidden bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 text-xs font-medium"
            >
                <button
                    class="px-3 py-1 rounded-md transition-colors"
                    :class="
                        activeTab === 'input'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400'
                    "
                    @click="activeTab = 'input'"
                >
                    Input
                </button>
                <button
                    class="px-3 py-1 rounded-md transition-colors"
                    :class="
                        activeTab === 'output'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400'
                    "
                    @click="activeTab = 'output'"
                >
                    Output
                </button>
            </div>
        </header>

        <!-- Options bar -->
        <div
            class="flex flex-wrap items-center gap-1.5 px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0"
        >
            <!-- Class name input -->
            <input
                v-model="rootClassName"
                class="font-mono text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500 w-36"
                placeholder="ClassName"
                spellcheck="false"
            />

            <div class="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />

            <!-- Option toggles -->
            <button
                v-for="opt in OPTION_LIST"
                :key="opt.key"
                class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border"
                :class="
                    opts[opt.key]
                        ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 hover:text-gray-600 dark:hover:text-gray-300'
                "
                :title="opt.description"
                @click="opts[opt.key] = !opts[opt.key]"
            >
                {{ opt.label }}
            </button>

            <div class="flex-1" />

            <!-- Copy button -->
            <UTooltip :text="copyLabel">
                <UButton
                    icon="i-heroicons-clipboard-document"
                    color="gray"
                    variant="soft"
                    size="xs"
                    :disabled="!dartOutput"
                    @click="copyOutput"
                >
                    <span class="hidden sm:inline">{{ copyLabel }}</span>
                </UButton>
            </UTooltip>
        </div>

        <!-- Error banner -->
        <Transition
            enter-active-class="transition-all duration-150"
            leave-active-class="transition-all duration-150"
            enter-from-class="opacity-0 -translate-y-1"
            leave-to-class="opacity-0 -translate-y-1"
        >
            <div
                v-if="parseError"
                class="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-mono shrink-0"
            >
                <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="w-3.5 h-3.5 shrink-0"
                />
                {{ parseError }}
            </div>
        </Transition>

        <!-- Editor area -->
        <div class="flex flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950">
            <!-- Left pane: JSON input -->
            <div
                class="flex-1 flex flex-col min-w-0"
                :class="isMobile && activeTab !== 'input' ? 'hidden' : 'flex'"
            >
                <div
                    class="px-3 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 select-none"
                >
                    JSON Input
                </div>
                <textarea
                    v-model="jsonInput"
                    class="flex-1 w-full p-3 sm:p-4 resize-none outline-none font-mono text-sm leading-relaxed bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-none"
                    spellcheck="false"
                    placeholder='Paste JSON here…&#10;&#10;{"id": 1, "name": "Flutter"}'
                />
            </div>

            <!-- Divider -->
            <div
                class="hidden md:block w-px bg-gray-200 dark:bg-gray-700 shrink-0"
            />

            <!-- Right pane: Dart output -->
            <div
                class="flex-1 flex flex-col min-w-0 overflow-hidden"
                :class="isMobile && activeTab !== 'output' ? 'hidden' : 'flex'"
            >
                <div
                    class="px-3 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 select-none flex items-center justify-between"
                >
                    <span>Dart Output</span>
                    <span v-if="classCount > 0" class="font-normal">
                        {{ classCount }}
                        {{ classCount === 1 ? "class" : "classes" }} generated
                    </span>
                </div>
                <div class="flex-1 overflow-auto">
                    <pre
                        v-if="dartOutput"
                        class="p-3 sm:p-4 font-mono text-sm leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre"
                        v-html="highlightDart(dartOutput)"
                    />
                    <div
                        v-else
                        class="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-600 select-none"
                    >
                        Dart classes will appear here
                    </div>
                </div>
            </div>
        </div>

        <!-- Status bar -->
        <footer
            class="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shrink-0 text-xs text-gray-500 dark:text-gray-400"
        >
            <div class="flex items-center gap-2 sm:gap-4">
                <span v-if="classCount"
                    >{{ classCount }}
                    {{ classCount === 1 ? "class" : "classes" }}</span
                >
                <span v-if="fieldCount">{{ fieldCount }} fields</span>
                <span v-if="opts.equatable" class="flex items-center gap-1">
                    <UIcon
                        name="i-heroicons-check-circle"
                        class="w-3 h-3 text-green-500"
                    />
                    Equatable
                </span>
            </div>
            <span class="select-none opacity-60 hidden sm:inline"
                >JSON to Dart</span
            >
        </footer>
    </div>
</template>

<script setup lang="ts">
useHead({ title: "JSON to Dart" });

// ── Mobile ────────────────────────────────────────────────────────────────────

const isMobile = ref(false);
const activeTab = ref<"input" | "output">("input");
const updateMobile = () => {
    isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
    updateMobile();
    window.addEventListener("resize", updateMobile);
});
onUnmounted(() => window.removeEventListener("resize", updateMobile));

// ── Options ───────────────────────────────────────────────────────────────────

type OptKey =
    | "nullSafety"
    | "finalFields"
    | "fromJson"
    | "toJson"
    | "copyWith"
    | "equatable";

const OPTION_LIST: { key: OptKey; label: string; description: string }[] = [
    {
        key: "nullSafety",
        label: "Null Safety",
        description:
            "Add ? to nullable types and required to non-nullable constructor params",
    },
    {
        key: "finalFields",
        label: "final",
        description: "Mark all fields as final",
    },
    {
        key: "fromJson",
        label: "fromJson",
        description: "Generate fromJson factory constructor",
    },
    { key: "toJson", label: "toJson", description: "Generate toJson() method" },
    {
        key: "copyWith",
        label: "copyWith",
        description: "Generate copyWith() method",
    },
    {
        key: "equatable",
        label: "Equatable",
        description:
            "Extend Equatable and generate props (requires equatable package)",
    },
];

const opts = reactive<Record<OptKey, boolean>>({
    nullSafety: true,
    finalFields: true,
    fromJson: true,
    toJson: true,
    copyWith: true,
    equatable: false,
});

// ── State ─────────────────────────────────────────────────────────────────────

const rootClassName = ref("UserModel");
const copyLabel = ref("Copy");

const jsonInput = ref(
    JSON.stringify(
        {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            isActive: true,
            score: 4.5,
            address: {
                street: "123 Main St",
                city: "New York",
                zipCode: "10001",
            },
            tags: ["flutter", "dart", "mobile"],
            orders: [
                { id: 101, product: "Widget Pro", quantity: 2, price: 29.99 },
            ],
        },
        null,
        2,
    ),
);

// ── Type definitions ──────────────────────────────────────────────────────────

interface DartField {
    name: string; // camelCase field name
    jsonKey: string; // original JSON key
    type: string; // full Dart type e.g. List<Order>
    baseType: string; // inner type without List<>
    isNullable: boolean;
    isArray: boolean;
    isObject: boolean; // custom nested class
    isPrimitive: boolean;
}

interface GenOpts {
    nullSafety: boolean;
    finalFields: boolean;
    fromJson: boolean;
    toJson: boolean;
    copyWith: boolean;
    equatable: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const toPascalCase = (s: string) =>
    s
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
        .replace(/^(.)/, (c) => c.toUpperCase());

const toCamelCase = (s: string) => {
    const p = toPascalCase(s);
    return p.charAt(0).toLowerCase() + p.slice(1);
};

const singularize = (word: string): string => {
    if (word.endsWith("ies")) return word.slice(0, -3) + "y";
    if (word.match(/(ss|us|is)$/i)) return word;
    if (word.match(/(ses|xes|zes)$/)) return word.slice(0, -2);
    if (word.endsWith("s")) return word.slice(0, -1);
    return word;
};

const getPrimitiveDartType = (val: unknown): string | null => {
    if (typeof val === "string") return "String";
    if (typeof val === "boolean") return "bool";
    if (typeof val === "number")
        return Number.isInteger(val) ? "int" : "double";
    return null;
};

// ── Field analysis ────────────────────────────────────────────────────────────

function analyzeField(
    key: string,
    value: unknown,
    mainCollector: string[],
    nestedCollector: string[],
    options: GenOpts,
): DartField {
    const name = toCamelCase(key);
    const jsonKey = key;

    // null
    if (value === null || value === undefined) {
        return {
            name,
            jsonKey,
            type: "dynamic",
            baseType: "dynamic",
            isNullable: true,
            isArray: false,
            isObject: false,
            isPrimitive: false,
        };
    }

    // primitives
    const prim = getPrimitiveDartType(value);
    if (prim) {
        return {
            name,
            jsonKey,
            type: prim,
            baseType: prim,
            isNullable: false,
            isArray: false,
            isObject: false,
            isPrimitive: true,
        };
    }

    // arrays
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return {
                name,
                jsonKey,
                type: "List<dynamic>",
                baseType: "dynamic",
                isNullable: false,
                isArray: true,
                isObject: false,
                isPrimitive: false,
            };
        }
        const first = value[0];
        const primEl = getPrimitiveDartType(first);
        if (primEl) {
            return {
                name,
                jsonKey,
                type: `List<${primEl}>`,
                baseType: primEl,
                isNullable: false,
                isArray: true,
                isObject: false,
                isPrimitive: true,
            };
        }
        if (
            first !== null &&
            typeof first === "object" &&
            !Array.isArray(first)
        ) {
            const nestedName = toPascalCase(singularize(key));
            generateDartClass(
                first as Record<string, unknown>,
                nestedName,
                nestedCollector,
                nestedCollector,
                options,
            );
            return {
                name,
                jsonKey,
                type: `List<${nestedName}>`,
                baseType: nestedName,
                isNullable: false,
                isArray: true,
                isObject: true,
                isPrimitive: false,
            };
        }
        return {
            name,
            jsonKey,
            type: "List<dynamic>",
            baseType: "dynamic",
            isNullable: false,
            isArray: true,
            isObject: false,
            isPrimitive: false,
        };
    }

    // nested object
    if (typeof value === "object") {
        const nestedName = toPascalCase(key);
        generateDartClass(
            value as Record<string, unknown>,
            nestedName,
            nestedCollector,
            nestedCollector,
            options,
        );
        return {
            name,
            jsonKey,
            type: nestedName,
            baseType: nestedName,
            isNullable: false,
            isArray: false,
            isObject: true,
            isPrimitive: false,
        };
    }

    return {
        name,
        jsonKey,
        type: "dynamic",
        baseType: "dynamic",
        isNullable: false,
        isArray: false,
        isObject: false,
        isPrimitive: false,
    };
}

// ── fromJson expression ───────────────────────────────────────────────────────

function fromJsonExpr(f: DartField): string {
    const v = `json['${f.jsonKey}']`;
    if (f.isNullable) return `${v}`;
    if (f.isArray) {
        const cast = `(${v} as List<dynamic>)`;
        if (!f.isObject) {
            if (f.baseType === "dynamic") return `${v} as List<dynamic>? ?? []`;
            return `${cast}.map((e) => e as ${f.baseType}).toList()`;
        }
        return `${cast}.map((e) => ${f.baseType}.fromJson(e as Map<String, dynamic>)).toList()`;
    }
    if (f.isObject) return `${f.type}.fromJson(${v} as Map<String, dynamic>)`;
    if (f.type === "double") return `(${v} as num).toDouble()`;
    return `${v} as ${f.type}`;
}

// ── toJson expression ─────────────────────────────────────────────────────────

function toJsonExpr(f: DartField): string {
    if (f.isArray && f.isObject)
        return `${f.name}.map((e) => e.toJson()).toList()`;
    if (f.isObject) return `${f.name}.toJson()`;
    return f.name;
}

// ── Class code builder ────────────────────────────────────────────────────────

function buildClassCode(
    className: string,
    fields: DartField[],
    options: GenOpts,
): string {
    const lines: string[] = [];
    const ext = options.equatable ? " extends Equatable" : "";

    lines.push(`class ${className}${ext} {`);

    // Fields
    if (fields.length) {
        for (const f of fields) {
            const fin = options.finalFields ? "final " : "";
            const nul = options.nullSafety && f.isNullable ? "?" : "";
            lines.push(`  ${fin}${f.type}${nul} ${f.name};`);
        }
        lines.push("");
    }

    // Constructor
    const con = options.finalFields ? "const " : "";
    lines.push(`  ${con}${className}({`);
    for (const f of fields) {
        const req = options.nullSafety && !f.isNullable ? "required " : "";
        lines.push(`    ${req}this.${f.name},`);
    }
    lines.push("  });");

    // fromJson
    if (options.fromJson) {
        lines.push("");
        lines.push(
            `  factory ${className}.fromJson(Map<String, dynamic> json) {`,
        );
        lines.push(`    return ${className}(`);
        for (const f of fields)
            lines.push(`      ${f.name}: ${fromJsonExpr(f)},`);
        lines.push("    );");
        lines.push("  }");
    }

    // toJson
    if (options.toJson) {
        lines.push("");
        lines.push("  Map<String, dynamic> toJson() {");
        lines.push("    return {");
        for (const f of fields)
            lines.push(`      '${f.jsonKey}': ${toJsonExpr(f)},`);
        lines.push("    };");
        lines.push("  }");
    }

    // copyWith
    if (options.copyWith) {
        lines.push("");
        lines.push(`  ${className} copyWith({`);
        for (const f of fields) {
            const nul = options.nullSafety ? "?" : "";
            lines.push(`    ${f.type}${nul} ${f.name},`);
        }
        lines.push("  }) {");
        lines.push(`    return ${className}(`);
        for (const f of fields)
            lines.push(`      ${f.name}: ${f.name} ?? this.${f.name},`);
        lines.push("    );");
        lines.push("  }");
    }

    // Equatable props
    if (options.equatable) {
        lines.push("");
        lines.push("  @override");
        lines.push(
            `  List<Object?> get props => [${fields.map((f) => f.name).join(", ")}];`,
        );
    }

    lines.push("}");
    return lines.join("\n");
}

// ── Class generator (recursive) ───────────────────────────────────────────────

function generateDartClass(
    obj: Record<string, unknown>,
    className: string,
    mainCollector: string[],
    nestedCollector: string[],
    options: GenOpts,
): void {
    const fields = Object.entries(obj).map(([k, v]) =>
        analyzeField(k, v, mainCollector, nestedCollector, options),
    );
    mainCollector.push(
        buildClassCode(toPascalCase(className), fields, options),
    );
}

// ── Entry point ───────────────────────────────────────────────────────────────

function convertToDart(
    jsonStr: string,
    className: string,
    options: GenOpts,
): { output: string; classCount: number; fieldCount: number; error: string } {
    try {
        const raw = jsonStr.trim();
        if (!raw)
            return { output: "", classCount: 0, fieldCount: 0, error: "" };
        const parsed = JSON.parse(raw);
        if (
            typeof parsed !== "object" ||
            parsed === null ||
            Array.isArray(parsed)
        ) {
            return {
                output: "",
                classCount: 0,
                fieldCount: 0,
                error: "Root JSON value must be an object { … }",
            };
        }
        const mainClasses: string[] = [];
        const nestedClasses: string[] = [];
        generateDartClass(
            parsed as Record<string, unknown>,
            className || "MyModel",
            mainClasses,
            nestedClasses,
            options,
        );

        const parts: string[] = [];
        if (options.equatable)
            parts.push("import 'package:equatable/equatable.dart';");
        const allClasses = [...mainClasses, ...nestedClasses];
        parts.push(...allClasses);
        const output = parts.join("\n\n");
        const fieldCount = (output.match(/^\s+(final |late )?\w/gm) || [])
            .length;
        return { output, classCount: allClasses.length, fieldCount, error: "" };
    } catch (e: any) {
        return { output: "", classCount: 0, fieldCount: 0, error: e.message };
    }
}

// ── Computed ──────────────────────────────────────────────────────────────────

const result = computed(() =>
    convertToDart(jsonInput.value, rootClassName.value, { ...opts }),
);

const dartOutput = computed(() => result.value.output);
const parseError = computed(() => result.value.error);
const classCount = computed(() => result.value.classCount);
const fieldCount = computed(() => result.value.fieldCount);

// ── Syntax highlight (tokenisation — avoids regex cross-contamination) ────────

const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function highlightDart(code: string): string {
    type Token = { start: number; end: number; cls: string };

    const patterns: { re: RegExp; cls: string }[] = [
        { re: /\/\/[^\n]*/g, cls: "dart-comment" },
        { re: /'(?:\\.|[^'\\])*'/g, cls: "dart-string" },
        { re: /@\w+/g, cls: "dart-annotation" },
        {
            re: /\b(class|extends|factory|const|final|required|return|this|import|export|override|get|set|async|await|if|else|for|while|in|null|true|false|late|abstract|static)\b/g,
            cls: "dart-keyword",
        },
        {
            re: /\b(String|int|double|bool|dynamic|void|List|Map|Set|Object|num|Never|DateTime)\b/g,
            cls: "dart-type",
        },
    ];

    // Collect all token ranges from the ORIGINAL string (no HTML yet)
    const tokens: Token[] = [];
    for (const { re, cls } of patterns) {
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(code)) !== null) {
            tokens.push({ start: m.index, end: m.index + m[0].length, cls });
        }
    }

    // Sort by position; discard overlapping tokens (first match wins)
    tokens.sort((a, b) => a.start - b.start || a.end - b.end);
    const clean: Token[] = [];
    let lastEnd = 0;
    for (const t of tokens) {
        if (t.start >= lastEnd) {
            clean.push(t);
            lastEnd = t.end;
        }
    }

    // Build the highlighted HTML in one pass over the original string
    let out = "";
    let pos = 0;
    for (const t of clean) {
        out += escapeHtml(code.slice(pos, t.start));
        out += `<span class="${t.cls}">${escapeHtml(code.slice(t.start, t.end))}</span>`;
        pos = t.end;
    }
    out += escapeHtml(code.slice(pos));
    return out;
}

// ── Copy ──────────────────────────────────────────────────────────────────────

const copyOutput = async () => {
    if (!dartOutput.value) return;
    try {
        await navigator.clipboard.writeText(dartOutput.value);
        copyLabel.value = "Copied!";
    } catch {
        copyLabel.value = "Failed";
    }
    setTimeout(() => (copyLabel.value = "Copy"), 2000);
};
</script>

<style>
.dart-keyword {
    @apply text-violet-600  dark:text-violet-400;
}
.dart-type {
    @apply text-blue-600    dark:text-blue-400;
}
.dart-string {
    @apply text-green-600   dark:text-green-400;
}
.dart-comment {
    @apply text-gray-400    dark:text-gray-500;
}
.dart-annotation {
    @apply text-amber-600   dark:text-amber-400;
}
</style>
