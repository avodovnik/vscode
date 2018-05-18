/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event as _Event, Emitter, mapEvent } from 'vs/base/common/event';

export type EventHandler = HTMLElement | HTMLDocument | Window;

export interface IDomEvent {
	<K extends keyof HTMLElementEventMap>(element: EventHandler, type: K, useCapture?: boolean): _Event<HTMLElementEventMap[K]>;
	(element: EventHandler, type: string, useCapture?: boolean): _Event<any>;
}

export const domEvent: IDomEvent = (element: EventHandler, type: string, useCapture?: boolean) => {
	const fn = e => emitter.fire(e);
	const emitter = new Emitter<any>({
		onFirstListenerAdd: () => {
			element.addEventListener(type, fn, useCapture);
		},
		onLastListenerRemove: () => {
			element.removeEventListener(type, fn, useCapture);
		}
	});

	return emitter.event;
};

export interface CancellableEvent {
	preventDefault();
	stopPropagation();
}

export function stop<T extends CancellableEvent>(event: _Event<T>): _Event<T> {
	return mapEvent(event, e => {
		e.preventDefault();
		e.stopPropagation();
		return e;
	});
}