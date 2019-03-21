function grow()
{
    for (x in Game.farm.crops)
    {
        for (y in Game.farm.crops[x])
        {
            crop = Game.farm.crops[x][y];

            if (crop.status !== "Dead" && crop.status !== "Mature" && crop.status !== "Empty")
                crop.grow();
        }
    }

    display();
}

function display()
{
    document.getElementById("stats").innerHTML = "";
    
    for (let stat in Game.stats)
    {
        let icon = new Image();
        icon.height = Game.iconSize;
        icon.width = Game.iconSize;
        icon.src = Game.interfacePath + stat + "Icon.png";
        icon.setAttribute("class", "statsIcon");
        
        let value = document.createElement("span");
        value.innerHTML = ": " + Game.stats[stat] + "<br>";
        
        document.getElementById("stats").appendChild(icon);
        document.getElementById("stats").appendChild(value);
    }
    
    if (Game.tools[Game.tool.mode] === "Seed")
    {
        Game.tool.info = Game.tool.seed.crop.name + " seeds<br>(" + (Game.tool.seed.price === 0 ? "Free" : Game.currency(Game.tool.seed.price)) + ")";
    }
    else if (Game.tools[Game.tool.mode] === "Inspect")
    {
        if (Game.tool.coords && Game.farm.crops[Game.tool.coords.x][Game.tool.coords.y] !== Game.dirt)
            Game.tool.info = Game.farm.crops[Game.tool.coords.x][Game.tool.coords.y].toString();
        else
            Game.tool.info = "Click on a crop to view details about it...";
    }
    else if (Game.tools[Game.tool.mode] === "Harvest")
    {
        if (!Game.tool.coords)
            Game.tool.info = "Click on a mature crop to harvest it...";
    }
    else if (Game.tools[Game.tool.mode] === "Construct")
    {
        Game.tool.info = "Add another row of plots to your farm...<br>(Next row costs " + Game.currency(Game.expandFarm(true)) + ")<br>";
        
        if (Game.stats.Money >= Game.expandFarm(true))
            document.getElementById("constructButton").style = "display: inline-block; visibility: visible;";
        else 
        {
            Game.tool.info += "<br>You can't afford to expand your farm yet...";
            document.getElementById("constructButton").style = "display: none;";
        }
    }
    else if (Game.tools[Game.tool.mode] === "Water")
    {
        if (Game.tool.coords && Game.farm.crops[Game.tool.coords.x][Game.tool.coords.y] !== Game.dirt)
            Game.tool.info = Game.farm.crops[Game.tool.coords.x][Game.tool.coords.y].toString();
        else
            Game.tool.info = "Click on a crop to water it...";
    }
    
    document.getElementById("output").innerHTML = Game.tool.info;
}

function drawFarm()
{
    let tiles = [];
    let x = -1;

    Game.farm.crops.forEach(function(row)
    {
        x++;
        tiles.push([]);

        row.forEach(function(crop)
        {
            tiles[x].push([crop.baseImage, crop.image]);
        });
    });
    
    drawCanvas("farmCanvas", tiles);
}

function drawShop()
{
    let tiles = [];
    let x = -1;
    let y = 3;

    Game.shop.seeds.forEach(function(seed)
    {
        if (y !== 3)
            y++;
        else {
            y = 0;
            x++;
            tiles.push([]);
        }
        
        tiles[x].push([Game.shopTile]);
        
        if (seed !== Game.tool.seed)
        {
            let image = new Image();
            image.src = Game.cropPath + (seed.crop.name).toLowerCase() + "/ShopIcon.png";
            tiles[x][y].push(image);
        }
        else
            Game.tool.coords = { x: x, y: y };
    });
    
    drawCanvas("infoCanvas", tiles);
}

function clearInfoCanvas()
{
    let canvas = document.getElementById("infoCanvas");
    canvas.height = 0;
    canvas.width = 0;
}

function drawToolbar()
{
    let tiles = [];
    
    let image = new Image();
    image.src = Game.interfacePath + Game.woodChoice + "Top.png";
    tiles.push([[image]]);
    
    Game.tools.forEach(function(tool)
    {
        if (tool !== Game.tools[Game.tool.mode])
        {
            image = new Image();
            image.src = Game.interfacePath + tool + "Tool.png";
            tiles.push([[Game.defaultPlank, image]]);
        }
        else
            tiles.push([[Game.defaultPlank]]);
    });
    
    image = new Image();
    image.src = Game.interfacePath + Game.woodChoice + "Bottom.png";
    tiles.push([[image]]);
    
    drawCanvas("toolbarCanvas", tiles);
}

function drawCanvas(canvasID, tiles)
{
    let canvas = document.getElementById(canvasID);
    
    canvas.height = Game.imageSize * tiles.length;
    canvas.width = Game.imageSize * tiles[0].length;
    
    for (let x = 0; x < tiles.length; x++)
    {
        for (let y = 0; y < tiles[x].length; y++)
        {
            fillCanvasCell(canvasID, { x: x, y: y }, tiles[x][y]);
        }
    }
    
    canvas.onmousedown = function(e)
    {
        var rect = canvas.getBoundingClientRect(),
        x = Math.floor((e.clientY - rect.top) / Game.imageSize),
        y = Math.floor((e.clientX - rect.left) / Game.imageSize);

        if (canvasID === "farmCanvas")
            Game.farm.interact({ x: x, y: y });
        else if (canvasID === "infoCanvas")
        {
            if (Game.tools[Game.tool.mode] === "Seed")
                Game.changeSeed({ x: x, y: y });
        }
        else
            Game.changeTool(x - 1);
    };
}

function fillCanvasCell(canvasID, coords, tiles)
{
    let context = document.getElementById(canvasID).getContext("2d");
    
    context.clearRect(Game.imageSize * coords.y, Game.imageSize * coords.x, Game.imageSize, Game.imageSize);
        
    tiles.forEach(function(tile)
    {
        context.drawImage(tile, Game.imageSize * coords.y, Game.imageSize * coords.x);
    });
}