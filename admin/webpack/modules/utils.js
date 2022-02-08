const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

exports.cleanDirectories = () => ({
	plugins: [
		new CleanWebpackPlugin({
			verbose: true,
			cleanOnceBeforeBuildPatterns: [
				'./js/*',
				'./css/*',
				'./images/*',
				'./static/*',
				'./fonts/*'
			]
		})
	]
})

const splitChunks = {
	// Режим разделения кода. По-умолчанию — async.
	chunks: 'all', // initial, all (async + initial)
	// Минимальный размер нового чанка для отделения.
	minSize: 30000, // bytes
	// Максимальный размер нового чанка для отделения.
	maxSize: 0,
	// Минимальное количество чанков, которые зависят от модуля
	// перед отделением этого модуля в отдельный чанк.
	minChunks: 1,
	// Максимальное количество одновременных параллельных запросов чанков для асинхронного сплит-поинта (динамический импорт).
	// Всегда предпочитаются чанки большего размера.
	maxAsyncRequests: 5,
	// Максимальное количество одновременных параллельных запросов чанков на один entrypoint.
	// Всегда предпочитаются чанки большего размера.
	maxInitialRequests: 3,
	// Символ-разделитель имени сплит-чанка (напр. vendors~main.js).
	automaticNameDelimiter: '~',
	// Определяет имя нового чанка
	name: true,
	// Мо-умолчанию cacheGroups наследует от остальных опций splitChunks ↑.
	// Уникальные для cacheGroups только test, priority и reuseExistingChunk.
	// Ключ каждой кеш-группы определяет её имя.
	// По-умолчанию вебпак устанавливает две кеш-группы:
	cacheGroups: {
		// Дефолтная кеш-группа. Выносит все зависимости из node_nodules в чанк vendors.
		vendors: {
			// Выбирает модули, внесённые в данную кеш-группу. Если не указать будут выбраны все модули.
			test: /[\\/]node_modules[\\/]/,
			priority: -10
		},
		default: {
			// Дефолтная кеш-группа. Выносит любой модуль-зависимость в отдельный чанк default
			// при условии дублирования модуля-зависимости хотя-бы в двух чанках.
			minChunks: 2,
			// Приоритет кеш-группы. Если модуль попадает сразу в несколько кеш-групп, то выбирется
			// кеш-группа с более высоким priority, или которая составляет чанк большего размера.
			// У дефолтных кеш-групп отрицательный приоритет,
			// поэтому кастомные кеш-группы приоритетнее (их priority 0 по-умолчанию).
			priority: -20,
			// Если чанк содержит уже существующий отделённый чанк,
			// то используется этот уже существующий отделённый чанк вместо создания нового
			reuseExistingChunk: true
		}
	}
}

const baseRules = {
	removeEmptyChunks: true,
	mergeDuplicateChunks: true,
	removeAvailableModules: true,
	providedExports: true,
	splitChunks
}

exports.optimizationsProd = () => ({
	optimization: {
		...baseRules,
		minimize: true,
		minimizer: [ new TerserPlugin() ],
		noEmitOnErrors: true,
		usedExports: true,
		// TODO webpack 5 remove optimization.occurrenceOrder
		occurrenceOrder: true,
		concatenateModules: true,
		sideEffects: true
	}
})

exports.optimizationsDev = () => ({
	optimization: {
		...baseRules,
		namedModules: true,
		namedChunks: true
	}
})

