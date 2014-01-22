constants = {};
constants.styles = [
    [0, 0, 255], // ocean
    [254, 240, 201], // sand
    [50, 205, 50], // grass
    [153, 153, 153], // mountain
]
constants.variants = [
    [100, 149, 237], // ocean
    [229, 216, 181], // sand
    [30, 123, 30], // grass
    [183, 153, 153], // mountain
]
constants.heights = {};
for (var i=0; i<constants.styles.length; i++) {
    constants.heights[constants.styles[i]] = i;
    constants.heights[constants.variants[i]] = i;
};
