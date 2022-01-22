--[[
  Input:
    KEYS[1] 'delayed'
    ARGV[1] next delayed timestamp
]]
-- Get the next 1000 jobs (at most)
local jobs = redis.call("ZRANGE", KEYS[1], 0, ARGV[1], "BYSCORE", "LIMIT", 0, 1000)
if (#jobs > 0) then
  -- Remove jobs from delyed queue
  redis.call("ZREM", KEYS[1], unpack(jobs))
end
return jobs