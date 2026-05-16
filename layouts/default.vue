<template>
    <div class="h-screen flex overflow-hidden">
        <!-- Slim icon sidebar -->
        <aside
            class="w-12 sm:w-14 flex flex-col shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-10"
        >
            <!-- Logo -->
            <div
                class="flex items-center justify-center h-10 sm:h-11 border-b border-gray-200 dark:border-gray-700 shrink-0"
            >
                <span class="text-base sm:text-lg select-none leading-none"
                    >✦</span
                >
            </div>

            <!-- Tool nav -->
            <nav
                class="flex flex-col items-center gap-1 p-1 sm:p-1.5 flex-1 pt-2"
            >
                <UTooltip
                    text="Markdown Editor"
                    :popper="{ placement: 'right' }"
                >
                    <NuxtLink v-slot="{ isActive, navigate }" to="/" custom>
                        <UButton
                            icon="i-heroicons-document-text"
                            color="gray"
                            :variant="isActive ? 'soft' : 'ghost'"
                            size="sm"
                            aria-label="Markdown Editor"
                            @click="navigate"
                        />
                    </NuxtLink>
                </UTooltip>

                <UTooltip
                    text="JSON Formatter"
                    :popper="{ placement: 'right' }"
                >
                    <NuxtLink v-slot="{ isActive, navigate }" to="/json" custom>
                        <UButton
                            icon="i-heroicons-code-bracket-square"
                            color="gray"
                            :variant="isActive ? 'soft' : 'ghost'"
                            size="sm"
                            aria-label="JSON Formatter"
                            @click="navigate"
                        />
                    </NuxtLink>
                </UTooltip>

                <UTooltip
                    text="JWT Decoder / Encoder"
                    :popper="{ placement: 'right' }"
                >
                    <NuxtLink v-slot="{ isActive, navigate }" to="/jwt" custom>
                        <UButton
                            icon="i-heroicons-key"
                            color="gray"
                            :variant="isActive ? 'soft' : 'ghost'"
                            size="sm"
                            aria-label="JWT Decoder / Encoder"
                            @click="navigate"
                        />
                    </NuxtLink>
                </UTooltip>
            </nav>

            <!-- Dark mode toggle -->
            <div
                class="flex items-center justify-center p-1 sm:p-1.5 border-t border-gray-200 dark:border-gray-700 shrink-0"
            >
                <UTooltip
                    :text="
                        colorMode.value === 'dark' ? 'Light mode' : 'Dark mode'
                    "
                    :popper="{ placement: 'right' }"
                >
                    <UButton
                        :icon="
                            colorMode.value === 'dark'
                                ? 'i-heroicons-sun'
                                : 'i-heroicons-moon'
                        "
                        color="gray"
                        variant="ghost"
                        size="sm"
                        :aria-label="
                            colorMode.value === 'dark'
                                ? 'Switch to light mode'
                                : 'Switch to dark mode'
                        "
                        @click="toggleColorMode"
                    />
                </UTooltip>
            </div>
        </aside>

        <!-- Page content -->
        <div class="flex-1 min-w-0 h-full overflow-hidden">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
const toggleColorMode = () => {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};
</script>
