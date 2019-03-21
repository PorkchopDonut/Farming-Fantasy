function Farm(rows)
{
    this.crops = [];
    this.size = rows;

    for (let x = 0; x < this.size; x++)
    {
        this.crops.push([]);

        for (let y = 0; y < Game.maxCrops; y++)
        {
            this.crops[x].push(Game.dirt);
        }
    }
}

Farm.prototype.isFreeSlot = function(coords)
{
    if (this.crops[coords.x][coords.y] === Game.dirt)
        return true;
    else
        return false;
};

Farm.prototype.findFreeSlot = function()
{
    for (x in this.crops)
        for (y in this.crops[x])
            if (this.isFreeSlot({ x: x, y: y }))
                return { x: x, y: y };

    return false;
};

Farm.prototype.addCrop = function(crop, coords)
{
    if (coords === -1)
    {
        coords = this.findFreeSlot();
        
        if (!coords)
            return false;
    }

    if (this.isFreeSlot(coords))
    {
        crop.coords = { x: coords.x, y: coords.y };
        this.crops[coords.x][coords.y] = crop;
        return true;
    }
    else
        return false;
};

Farm.prototype.increaseSize = function()
{
    this.size++;
	
    this.crops.push([]);
    
    for (let y = 0; y < Game.maxCrops; y++)
        this.crops[this.size - 1].push(Game.dirt);
};

Farm.prototype.interact = function(coords)
{
    if (Game.tools[Game.tool.mode] === "Seed")
    {
        if (Game.stats.Money >= Game.tool.seed.price && this.crops[coords.x][coords.y] === Game.dirt)
        {
            Game.stats.Money -= Game.tool.seed.price;
            this.addCrop(jQuery.extend(true, {}, Game.tool.seed.crop), coords);
        }
    }
    else if (Game.tools[Game.tool.mode] === "Inspect")
        Game.tool.coords = coords;
    else if (Game.tools[Game.tool.mode] === "Harvest")
    {
        if (this.crops[coords.x][coords.y] !== Game.dirt && this.crops[coords.x][coords.y].status !== "Growing")
            this.sellCrop(coords);
    }
    else if (Game.tools[Game.tool.mode] === "Water")
    {
        Game.tool.coords = coords;
        
        if (this.crops[coords.x][coords.y] !== Game.dirt)
            this.crops[coords.x][coords.y].water();
    }
};

Farm.prototype.drawCrop = function(crop)
{
    fillCanvasCell("farmCanvas", crop.coords, [crop.baseImage, crop.image]);
};

Farm.prototype.sellCrop = function(coords)
{
    let crop = this.crops[coords.x][coords.y];
    
    Game.tool.coords = coords;
    
    if (crop.status === "Mature")
    {
        Game.stats.Money += crop.value;
        Game.tool.info = "Sold mature " + crop.name + " crop for " + Game.currency(crop.value) + "!";
    }
    else if (crop.status === "Dead")
        Game.tool.info = "Pulled dead " + crop.name + " crop...<br>(Lost " + Game.currency(crop.value) + "...)";

    this.crops[coords.x][coords.y] = Game.dirt;
    this.crops[coords.x][coords.y].coords = coords;
    fillCanvasCell("farmCanvas", coords, [Game.defaultBase]);
};