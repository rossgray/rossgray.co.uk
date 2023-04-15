const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  // plugins
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPassthroughCopy("src/assets/css/prism.css");
  eleventyConfig.addPassthroughCopy("src/assets/img/*");

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return dateObj.toLocaleDateString("en-GB", options);
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return dateObj.toISOString();
  });

  return {
    dir: {
      input: "src",
      data: "_data",
      includes: "_includes",
      layouts: "_layouts",
    },
    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",
  };
};
