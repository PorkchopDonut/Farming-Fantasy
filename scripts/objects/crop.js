function Crop(name, mature, value, hydration)
{
    this.name = name;
    this.status = "Growing";
    this.lastGrowths = [];
    this.averageGrowth = 0.0;
    this.growth = 0.0;
    this.mature = mature;
    this.value = value;
    this.baseImage = Game.defaultBaseImages[2];
    this.image = Game.defaultBaseImages[2];
    
    let images = ["Dead", "Harvest", "ShopIcon", "Stage1", "Stage2", "Stage3", "Stage4"];
    
    if (this.name !== "Empty")
    {
        for (let name in images)
        {
            let newImage = new Image();
            newImage.src = Game.cropPath + (this.name).toLowerCase() + "/" + images[name] + ".png";
            this[images[name] + "Image"] = newImage;
        }
    }

    if (Game.hydration)
    {
        this.hydration = hydration;
    }
}

Crop.prototype.toString = function()
{
    let output = "";
    
    output += this.name + " (" + this.status + ")<br>";
    output += this.status === "Growing" ? "<br>" + ((this.growth / this.mature) * 100).toFixed(1) + "% (" + Math.ceil(((this.mature - this.growth) / this.averageGrowth) * (Game.speed / 1000)) + " seconds to harvest)" : "";
    
    if (Game.hydration)
        output += this.status === "Growing" ? ("<br>Hydration: " + this.hydration.current.toFixed(2) + "/" + this.hydration.optimal.toFixed(2) + " (Last growth: " + this.lastGrowths[this.lastGrowths.length - 1].toFixed(1) + ")").fontcolor(this.growthAssociation) : "";
    
    return output;
};
        
Crop.prototype.growthRate = function()
{
    let output;

    if (Game.hydration)
    {
        output = ((-1.0 * (1 / this.hydration.sensitivity)) * (Math.abs(this.hydration.current - this.hydration.optimal))) + this.hydration.efficiency;

        if (output.toFixed(1) <= 0)
            this.growthAssociation = "red";
        else if (output.toFixed(1) >= (this.hydration.efficiency - 0.2) && output <= (this.hydration.efficiency + 0.2))
            this.growthAssociation = "lightblue";
        else
            this.growthAssociation = "green";
    }
    else
        output = randomInt(1, 3);

    if (this.lastGrowths.length === 100)
        this.lastGrowths.splice(0, 1);
        
    this.lastGrowths.push(output);
    this.calculateAverage();
    
    return output;
};

Crop.prototype.grow = function()
{
    let lastBase = this.baseImage;
    let lastImage = this.image;
    
    this.growth += this.growthRate();

    if (Game.hydration)
    {
        this.hydration.current -= (Game.dehydrationRate * this.hydration.efficiency);
        
        let choice = 2;
        
        if (this.growthAssociation === "red" && this.hydration.current < this.hydration.optimal)
            choice = 0;
        else if (this.growthAssociation === "green" && this.hydration.current < this.hydration.optimal)
            choice = 1;
        else if (this.growthAssociation === "green" && this.hydration.current > this.hydration.optimal)
            choice = 3;
        else if (this.growthAssociation === "red" && this.hydration.current > this.hydration.optimal)
            choice = 4;
            
        this.baseImage = Game.defaultBaseImages[choice];
    }

    if (this.growth < 0)
    {
        this.status = "Dead";
        this.growth = 0;
        this.image = this["DeadImage"];
    }
    else if (this.growth >= this.mature)
    {
        this.status = "Mature";
        this.growth = this.mature;
        this.image = this["HarvestImage"];
    }
    else
    {
        this.status = "Growing";
        
        let percentage = (this.growth / this.mature) * 100;
        let numeral = 1;
        
        if (percentage >= 25 && percentage < 50)
            numeral = 2;
        else if (percentage >= 50 && percentage < 75)
            numeral = 3;
        else if (percentage >= 75 && percentage < 100)
            numeral = 4;
        
        this.image = this["Stage" + numeral + "Image"];
    }
    
    if (this.image !== lastImage || this.baseImage !== lastBase)
        Game.farm.drawCrop(this);
};

Crop.prototype.calculateAverage = function()
{
    let sum = 0.0;
    
    this.lastGrowths.forEach(function(growth)
    {
        sum += growth;
    });
    
    this.averageGrowth = sum / this.lastGrowths.length;
};

Crop.prototype.water = function()
{
    this.hydration.current += 0.25;
};