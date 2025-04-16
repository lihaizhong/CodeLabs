function entry(fn, options) {
	try {
		return fn();
	} catch (ex) {
		options?.eachError?.(ex);
		return entry(fn, options);
	}
}
