/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import * as vscode from 'vscode';
import 'mocha';

import MarkdownSmartSelect from '../features/smartSelect';
import { InMemoryDocument } from './inMemoryDocument';
import { createNewMarkdownEngine } from './engine';

const testFileName = vscode.Uri.file('test.md');

suite.only('markdown.SmartSelect', () => {
	test('Smart select single word', async () => {
		const selections = await getSelectionRangesForDocument(`Hello`, [new vscode.Position(0, 0)]);
		assert.strictEqual(selections[0].range.start.line, 0);
		assert.strictEqual(selections[0].range.end.line, 1);
	});

	test('Smart select html blocks', async () => {
		const selections = await getSelectionRangesForDocument(`<p align="center">
		<img alt="VS Code in action" src="https://user-images.githubusercontent.com/1487073/58344409-70473b80-7e0a-11e9-8570-b2efc6f8fa44.png">
	  </p>`, [new vscode.Position(0, 0)]);
		assert.strictEqual(selections[0].range.start.line, 0);
		assert.strictEqual(selections[0].range.end.line, 3);
	});
	test('Smart select paragraph', async () => {
		const selections = await getSelectionRangesForDocument(`Many of the core components and extensions to VS Code live in their own repositories on GitHub. For example, the [node debug adapter](https://github.com/microsoft/vscode-node-debug) and the [mono debug adapter](https://github.com/microsoft/vscode-mono-debug) have their own repositories. For a complete list, please visit the [Related Projects](https://github.com/microsoft/vscode/wiki/Related-Projects) page on our [wiki](https://github.com/microsoft/vscode/wiki).`, [new vscode.Position(0, 0)]);
		assert.strictEqual(selections[0].range.start.line, 0);
		assert.strictEqual(selections[0].range.end.line, 1);
	});
	test('Smart select single word w parent header on header line', async () => {
		const selections = await getSelectionRangesForDocument(`#Header
		Hello`, [new vscode.Position(0, 0)]);
		assert.strictEqual(selections[0].range.start.line, 0);
		assert.strictEqual(selections[0].range.end.line, 2);
	});
	test('Smart select single word w grandparent header on text line', async () => {
		const selections = await getSelectionRangesForDocument(`##ParentHeader
		#Header
		Hello`, [new vscode.Position(1, 3)]);
		assert.strictEqual(selections[0].range.start.line, 0);
		assert.strictEqual(selections[0].range.end.line, 3);
	});
	test('Smart select html blocks w parent header', async () => {
		const selections = await getSelectionRangesForDocument(`#Header
		<p align="center">
		<img alt="VS Code in action" src="https://user-images.githubusercontent.com/1487073/58344409-70473b80-7e0a-11e9-8570-b2efc6f8fa44.png">
	  </p>`, [new vscode.Position(0, 0)]);
		assert.strictEqual(selections[0].range.start.line, 0);
		assert.strictEqual(selections[0].range.end.line, 4);
	});
	test('Smart select fenced code block', async () => {
		const selections = await getSelectionRangesForDocument(`~~~
			a
			~~~`, [new vscode.Position(0, 0)]);
		assert.strictEqual(selections[0].range.start.line, 1);
		assert.strictEqual(selections[0].range.end.line, 2);
	});
	test('Smart select list', async () => {
		const selections = await getSelectionRangesForDocument(`- item 1
		- item 2
		- item 3
		- item 4`, [new vscode.Position(0, 0)]);
		assert.strictEqual(selections[0].range.start.line, 0);
		assert.strictEqual(selections[0].range.end.line, 4);
	});
	test('Smart select list multi-line cursor', async () => {
		const selections = await getSelectionRangesForDocument(`- item 1
		- item 2
		- item 3
		- item 4`, [new vscode.Position(0, 0), new vscode.Position(1, 0)]);
		assert.strictEqual(selections[0].range.start.line, 0);
		assert.strictEqual(selections[0].range.end.line, 4);
		assert.strictEqual(selections[1].range.start.line, 0);
		assert.strictEqual(selections[1].range.end.line, 4);
	});
});

async function getSelectionRangesForDocument(contents: string, positions: vscode.Position[]) {
	const doc = new InMemoryDocument(testFileName, contents);
	const provider = new MarkdownSmartSelect(createNewMarkdownEngine());
	return await provider.provideSelectionRanges(doc, positions, new vscode.CancellationTokenSource().token);
}
