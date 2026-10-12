// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

export const SHORTCUTS_SETTINGS_VERSION = 2;

type SerializedShortcuts = {
    version?: number;
    keyMap: Record<string, { sequences: string[] }>;
};

const shortcutsMigrations: Record<number, (shortcuts: SerializedShortcuts) => void> = {
    1: (shortcuts: SerializedShortcuts): void => {
        const shortcutMigrations: Record<string, string> = {
            SAVE_JOB: 'command+s',
            UNDO: 'command+z',
            REDO: 'command+shift+z',
            AUDIO_UNDO: 'command+z',
            AUDIO_REDO: 'command+shift+z',
            COPY_SHAPE: 'command+c',
            PASTE_SHAPE: 'command+v',
        };

        Object.entries(shortcutMigrations).forEach(([shortcutID, commandSequence]) => {
            const shortcut = shortcuts.keyMap[shortcutID];
            if (shortcut && !shortcut.sequences.includes(commandSequence)) {
                shortcut.sequences.push(commandSequence);
            }
        });
    },
    2: (shortcuts: SerializedShortcuts): void => {
        // these keys are used to change brush size now
        const releasedSequences = ['+', '=', '-', '_'];
        ['TO_BACKGROUND', 'TO_FOREGROUND'].forEach((shortcutID) => {
            const shortcut = shortcuts.keyMap[shortcutID];
            if (shortcut) {
                shortcut.sequences = shortcut.sequences.filter((sequence) => !releasedSequences.includes(sequence));
            }
        });
    },
};

export function migrateShortcutsSettings(shortcuts: SerializedShortcuts): SerializedShortcuts | null {
    if ((shortcuts.version ?? 0) >= SHORTCUTS_SETTINGS_VERSION) {
        return null;
    }

    const migratedShortcuts = structuredClone(shortcuts);
    for (
        let futureVersion = (shortcuts.version ?? 0) + 1;
        futureVersion <= SHORTCUTS_SETTINGS_VERSION;
        futureVersion++
    ) {
        shortcutsMigrations[futureVersion]?.(migratedShortcuts);
    }

    migratedShortcuts.version = SHORTCUTS_SETTINGS_VERSION;
    return migratedShortcuts;
}
