module.exports = {
	extends: ['./eslint.config.mjs'],
	rules: {
		'@typescript-eslint/no-floating-promises': 'warn',
		'@typescript-eslint/no-misused-promises': 'warn',
		'prettier/prettier': 'warn',
	},
};
