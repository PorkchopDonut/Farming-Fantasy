var Game = {};
Game.fps = 50;
Game.speed = 5000 / Game.fps;
Game.difficulty = 0;

Game.hydration = false;
Game.dehydrationRate = 0.001;
Game.hydrationRate = 0.05;

Game.cropPath = "./assets/crops/";
Game.interfacePath = "./assets/interface/";
Game.imageSize = 100;
Game.iconSize = 18;

Game.season = "Spring";
Game.baseBackgroundVariants = 3;

Game.backgroundVariants = [];
for (let x = 0; x < 8; x++)
{
    let image = new Image();
    image.src = Game.interfacePath + "Background/Spring" + (x + 1) + ".png";
    Game.backgroundVariants.push(image);
}

Game.woodChoice = "Birch";

Game.defaultBaseImages = [];
for (let x = 0; x < 5; x++)
{
    let image = new Image();
    image.src = Game.cropPath + Game.woodChoice + "Base" + (x + 1) + ".png";
    Game.defaultBaseImages.push(image);
}
Game.defaultBase = Game.defaultBaseImages[2];

Game.defaultPlank = new Image();
Game.defaultPlank.src = Game.interfacePath + Game.woodChoice + "Mid1.png";

Game.shopTile = new Image();
Game.shopTile.src = Game.interfacePath + Game.woodChoice + "ShopTile.png";

Game.maxCrops = 4;

Game.tools = ["Inspect", "Seed", "Harvest", "Construct"];
Game.toolImages = [];
for (let x = 0; x < Game.tools.length; x++)
{
    let image = new Image();
    image.src = Game.interfacePath + Game.tools[x] + "Tool.png";
    Game.toolImages.push(image);
}

Game.waterImage = new Image();
Game.waterImage.src = Game.interfacePath + "WaterTool.png";

Game.defaultTool = 0;
Game.tool = { mode: Game.defaultTool };

Game.shop = {};

Game.stats = { Money: 0.00 };

Game.run = function()
{
    display();
    grow();
};

Game.currency = function(value)
{
    if (value === 1)
        return value + " coin";
    else
        return value + " coins";
};

Game.changeTool = function(tool)
{
    if (tool !== -1 && tool !== this.tools.length && !(tool === this.tool.mode && this.tool.mode === this.defaultTool))
    {
        fillCanvasCell("toolbarCanvas", { x: this.tool.mode + 1, y: 0 }, [this.defaultPlank, this.toolImages[this.tool.mode]]);
        
        this.tool.coords = false;
        clearInfoCanvas();
        
        if (tool === this.tool.mode)
            this.tool.mode = this.defaultTool;
        else
            this.tool.mode = tool;
        
        if (this.tools[this.tool.mode] === "Seed")
        {
            drawShop();
            fillCanvasCell("toolCanvas", { x: 0, y: 0 }, [this.tool.seed.crop["ShopIconImage"]]);
        }
        else
            fillCanvasCell("toolCanvas", { x: 0, y: 0 }, [this.toolImages[this.tool.mode]]);
        
        fillCanvasCell("toolbarCanvas", { x: this.tool.mode + 1, y: 0 }, [this.defaultPlank]);
    }
};

Game.changeSeed = function(coords)
{
    let seed = (coords.x * 4) + coords.y;
    
    if (seed < this.shop.seeds.length && this.shop.seeds[seed] !== this.tool.seed)
    {
        fillCanvasCell("infoCanvas", { x: this.tool.coords.x, y: this.tool.coords.y }, [Game.shopTile, this.tool.seed.crop["ShopIconImage"]]);
        
        this.tool.seed = this.shop.seeds[seed];
        
        fillCanvasCell("toolCanvas", { x: 0, y: 0 }, [this.tool.seed.crop["ShopIconImage"]]);
        fillCanvasCell("infoCanvas", { x: coords.x, y: coords.y }, [Game.shopTile]);
        
        Game.tool.coords = coords;
    }
};

Game.expandFarm = function(cost)
{
    if (cost)
        return (100 + (this.difficulty * 0.5)) * (this.farm.size - 1);
    else
    {
        this.stats.Money -= this.expandFarm(true);
        this.farm.increaseSize();
        drawFarm();
    }
};

function randomInt(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initialize(difficulty)
{
    Game.difficulty = difficulty;
    
    Game.dirt = new Crop("Empty", -1.0, {});
    Game.dirt.status = "Empty";
    
    if (Game.difficulty > 0)
    {
        Game.hydration = true;
        Game.tools.push("Water");
        Game.toolImages.push(Game.waterImage);
    }

    document.getElementById("initialPanel").hidden = true;
    
    Game.farm = new Farm(2);
    
    drawFarm();
    drawToolbar();
        
    fillCanvasCell("toolCanvas", { x: 0, y: 0 }, [Game.toolImages[Game.tool.mode]]);
    
    Game.tool.coords = false;
    
    Game.shop.seeds = 
    [
        { price: 0, crop: new Crop("Potato", 500.0, 1.0, { current: 5.0, optimal: 5.0, sensitivity: 1.0, efficiency: 1.0 }) },
        { price: 3, crop: new Crop("Carrot", 1200.0, 10.0, { current: 6.0, optimal: 6.0, sensitivity: 0.5, efficiency: 2.0 }) }
    ];
    
    Game.tool.seed = Game.shop.seeds[0];

    Game._intervalID = setInterval(Game.run, Game.speed);
}
    
$(document).mousemove(function(e)
{
    $(".mousePet").css({ left: e.pageX + 1, top: e.pageY + 1});
});

function generateBackground()
{
    let canvas = document.getElementById("canvas");
    let ctx = this.canvas.getContext("2d");
    let canvasSize = 50;

    canvas.width = canvasSize * Game.imageSize;
    canvas.height = canvasSize * Game.imageSize;
    
    let tiles = [];
    
    for (let x = 0; x < canvasSize; x++)
    {
        tiles.push([]);
        
        for (let y = 0; y < canvasSize; y++)
        {
            let randomNum;
            
            while(true)
            {
                randomNum = Math.floor(Math.random() * (Game.backgroundVariants.length));
                
                if (randomNum < Game.backgroundVariants.length || (y < 1 || tiles[x][y - 1] !== randomNum) || (x < 1 || (tiles[x - 1][y] !== randomNum && tiles[x - 1][y - 1] !== randomNum && (y < canvasSize - 1 || tiles[x - 1][y + 1] !== randomNum))))
                    break;
            }
            
            tiles[x].push(Game.backgroundVariants[randomNum]);
        }
    }
    
    for (let x in tiles)
    {
        for (let y in tiles[x])
        {
            ctx.drawImage(tiles[x][y], x * Game.imageSize, y * Game.imageSize);
        }
    }
}