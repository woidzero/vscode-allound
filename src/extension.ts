import {
  workspace,
  ExtensionContext,
  commands,
  window,
  QuickPickItem,
  SnippetString,
  Selection,
  Position,
} from "vscode";

interface IAlloundItem {
  label: string;
  description?: string;
  detail?: string;
  snippet: string;
  disabled?: boolean;
  languageIds?: string;
}

interface IAlloundConfig {
  [key: string]: IAlloundItem;
}

function getLanguageId(): string | undefined {
  let editor = window.activeTextEditor;
  if (editor === undefined) {
    return undefined;
  }
  return editor.document.languageId;
}

function filterAlloundItems(items: IAlloundItem[], languageId?: string) {
  if (languageId === undefined) {
    return items;
  }
  return items.filter((item) => {
    if (!item.languageIds || item.languageIds.length < 1) {
      return true;
    }

    if (item.languageIds.includes(`-${languageId}`)) {
      return false;
    }

    if (
      item.languageIds.includes("*") ||
      item.languageIds.includes(languageId)
    ) {
      return true;
    }

    return false;
  });
}

function getAlloundConfig(): IAlloundConfig {
  let config = workspace.getConfiguration("allound");
  const showOnlyUserDefinedSnippets = config.get(
    "showOnlyUserDefinedSnippets",
    false
  );
  const items = showOnlyUserDefinedSnippets
    ? {}
    : <IAlloundConfig>config.get("with", {});
  const custom = <IAlloundConfig>config.get("custom", {});

  for (const key of Object.keys(custom)) {
    if (typeof custom[key] !== "object" || !custom[key].label) {
      window.showErrorMessage(
        `Invalid custom config for Allound: allound.custom.${key}!\nPlease check your settings!`
      );
      return { ...items };
    }
  }

  return { ...items, ...custom };
}

function getEnabledAlloundItems(alloundConfig: IAlloundConfig) {
  const items: IAlloundItem[] = [];
  Object.keys(alloundConfig).forEach((alloundItemKey) => {
    const alloundItem: IAlloundItem = alloundConfig[alloundItemKey];
    if (!alloundItem.disabled) {
      items.push(alloundItem);
    }
  });
  return items;
}

function trimSelection(selection: Selection): Selection | undefined {
  let activeEditor = window.activeTextEditor;
  if (activeEditor && selection) {
    const startLine = selection.start.line;
    const endLine = selection.end.line;

    let startPosition: Position | undefined = undefined;
    let endPosition: Position | undefined = undefined;

    for (let lineNo = startLine; lineNo <= endLine; lineNo++) {
      const line = activeEditor.document.lineAt(lineNo);
      if (line.isEmptyOrWhitespace) {
        continue;
      }

      if (
        lineNo === startLine &&
        !line.text.slice(selection.start.character).trim()
      ) {
        continue;
      }

      if (
        lineNo > startLine &&
        lineNo === endLine &&
        selection.end.character < line.firstNonWhitespaceCharacterIndex
      ) {
        continue;
      }

      if (!startPosition) {
        // find start character index
        let startCharacter = line.firstNonWhitespaceCharacterIndex;

        if (lineNo === startLine) {
          startCharacter = Math.max(startCharacter, selection.start.character);
        }

        startPosition = new Position(lineNo, startCharacter);
      }

      // find end character index
      let endCharacter =
        line.firstNonWhitespaceCharacterIndex + line.text.trim().length;

      if (lineNo === endLine) {
        endCharacter = Math.min(endCharacter, selection.end.character);
      }

      endPosition = new Position(lineNo, endCharacter);
    }

    if (startPosition && endPosition) {
      return new Selection(startPosition, endPosition);
    }
  }

  return undefined;
}

function trimSelections(): void {
  let activeEditor = window.activeTextEditor;
  if (activeEditor && activeEditor.selections) {
    const selections: Selection[] = [];

    activeEditor.selections.forEach((selection: Selection) => {
      if (
        selection.start.line === selection.end.line &&
        selection.start.character === selection.end.character
      ) {
        return selections.push(selection);
      }

      const trimmedSelection = trimSelection(selection);
      if (trimmedSelection) {
        selections.push(trimmedSelection);
      }
    });

    activeEditor.selections = selections;
  }
}

function applyQuickPick(item: QuickPickItem, alloundItems: IAlloundItem[]) {
  const activeEditor = window.activeTextEditor;

  if (activeEditor && item) {
    const alloundItem = alloundItems.find((s) => item.label === s.label);
    if (alloundItem) {
      try {
        trimSelections();
        activeEditor.insertSnippet(new SnippetString(alloundItem.snippet));
      } catch (err) {
        window.showErrorMessage(
          "Could not apply Allound snippet: " + alloundItem.label,
          String(err)
        );
      }
    }
  }
}

function applyAlloundItem(key: string, alloundConfig: IAlloundConfig) {
  if (window.activeTextEditor && alloundConfig[key]) {
    const alloundItem: IAlloundItem = alloundConfig[key];
    window.activeTextEditor.insertSnippet(
      new SnippetString(alloundItem.snippet)
    );
  }
}

function registerCommands(
  context: ExtensionContext,
  alloundConfig: IAlloundConfig
) {
  commands.getCommands().then((cmdList: string | string[]) => {
    Object.keys(alloundConfig).forEach((key) => {
      const cmdText = `allound.with.${key}`;
      if (cmdList.indexOf(cmdText) === -1) {
        context.subscriptions.push(
          commands.registerCommand(cmdText, () => {
            applyAlloundItem(key, alloundConfig);
          })
        );
      }
    });
  });
}


export function activate(context: ExtensionContext) {
  let alloundItems: IAlloundItem[] = [];
  let showRecentlyUsedFirst = true;
  let alloundConfig: IAlloundConfig;

  function update() {
    alloundConfig = getAlloundConfig();

    showRecentlyUsedFirst = !!workspace
      .getConfiguration("alloud")
      .get("showRecentlyUsedFirst");
    alloundItems = getEnabledAlloundItems(alloundConfig);

    registerCommands(context, alloundConfig);
  }

  workspace.onDidChangeConfiguration(() => {
    update();
  });

  update();

  let disposable = commands.registerCommand("allound.with", async () => {
    let quickPickItems = filterAlloundItems(
      alloundItems,
      getLanguageId()
    ).map(({ label, description }) => ({
      label,
      description,
    }));

    const item = await window.showQuickPick(quickPickItems, {
      placeHolder: "Type the label of the snippet",
      matchOnDescription: true,
    });

    if (!item) {
      return;
    }

    applyQuickPick(item, alloundItems);

    const selectedAlloundItem = alloundItems.find(
      (i) => i.label === item.label && i.description === item.description
    );

    if (showRecentlyUsedFirst && selectedAlloundItem) {
      alloundItems = alloundItems.filter(
        (i) => i.label !== item.label || i.description !== item.description
      );
      alloundItems.unshift(selectedAlloundItem);
    }
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
