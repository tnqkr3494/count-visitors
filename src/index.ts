export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	DB: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

// @ts-ignore
import home from './home.html';
import { makeBadge } from './utils';

function handleHome() {
	return new Response(home, {
		headers: {
			'Content-Type': 'text/html;chartset=utf-8',
		},
	});
}

function handleNotFound() {
	return new Response(null, {
		status: 404,
	});
}

function handleBadRequest() {
	return new Response(null, {
		status: 400,
	});
}

async function handleVisit(searchParams: URLSearchParams, env: Env) {
	const page = searchParams.get('page');
	if (!page) {
		return handleBadRequest();
	}
	const kvPage = await env.DB.get(page);
	let count = 1;
	if (!kvPage) {
		await env.DB.put(page, String(count));
	} else {
		count = parseInt(kvPage) + 1;
		await env.DB.put(page, String(count));
	}

	return new Response(makeBadge(count), {
		headers: {
			'Content-Type': 'image/svg+xml;charset=utf-8',
		},
	});
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { searchParams, pathname } = new URL(request.url);
		switch (pathname) {
			case '/':
				return handleHome();
			case '/visit':
				return handleVisit(searchParams, env);
			default:
				return handleNotFound();
		}
	},
};

/*
사용법 : 
npm run start가 아니라 wrangler dev --remote 이걸로 시작해야 로컬에서 실행시 preview에 데이터가 저장됨.
완성후 npm run deploy를 사용하면 프로그램 완성
*/
