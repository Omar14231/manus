-- RTX-like cinematic graphics for Roblox Studio
-- Place this LocalScript in StarterPlayer > StarterPlayerScripts.
-- This improves lighting and post-processing; it is not real RTX.

local Lighting = game:GetService("Lighting")
local Terrain = workspace:FindFirstChildOfClass("Terrain")

pcall(function()
	Lighting.Technology = Enum.Technology.Future
end)

Lighting.GlobalShadows = true
Lighting.Brightness = 2
Lighting.ExposureCompensation = 0.15
Lighting.EnvironmentDiffuseScale = 0.8
Lighting.EnvironmentSpecularScale = 1
Lighting.ClockTime = 15

local effectNames = {
	"CinematicBloom",
	"CinematicColor",
	"CinematicSunRays",
	"CinematicAtmosphere",
	"CinematicDepthOfField",
}

for _, name in ipairs(effectNames) do
	local oldEffect = Lighting:FindFirstChild(name)
	if oldEffect then
		oldEffect:Destroy()
	end
end

local bloom = Instance.new("BloomEffect")
bloom.Name = "CinematicBloom"
bloom.Intensity = 0.35
bloom.Size = 28
bloom.Threshold = 1.1
bloom.Parent = Lighting

local color = Instance.new("ColorCorrectionEffect")
color.Name = "CinematicColor"
color.Brightness = 0.03
color.Contrast = 0.18
color.Saturation = 0.12
color.TintColor = Color3.fromRGB(255, 248, 238)
color.Parent = Lighting

local sunRays = Instance.new("SunRaysEffect")
sunRays.Name = "CinematicSunRays"
sunRays.Intensity = 0.08
sunRays.Spread = 0.75
sunRays.Parent = Lighting

local atmosphere = Instance.new("Atmosphere")
atmosphere.Name = "CinematicAtmosphere"
atmosphere.Density = 0.22
atmosphere.Offset = 0.1
atmosphere.Color = Color3.fromRGB(205, 220, 255)
atmosphere.Decay = Color3.fromRGB(120, 145, 190)
atmosphere.Glare = 0.12
atmosphere.Haze = 0.7
atmosphere.Parent = Lighting

local depthOfField = Instance.new("DepthOfFieldEffect")
depthOfField.Name = "CinematicDepthOfField"
depthOfField.FocusDistance = 45
depthOfField.InFocusRadius = 35
depthOfField.NearIntensity = 0.03
depthOfField.FarIntensity = 0.08
depthOfField.Parent = Lighting

if Terrain then
	Terrain.WaterColor = Color3.fromRGB(35, 125, 190)
	Terrain.WaterReflectance = 0.35
	Terrain.WaterTransparency = 0.18
	Terrain.WaterWaveSize = 0.25
	Terrain.WaterWaveSpeed = 8
end

print("Cinematic RTX-like graphics enabled")
