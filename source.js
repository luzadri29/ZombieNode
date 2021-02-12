const { query } = require('./db');

const getReqParams = (r) => {
  const d = {};
  r.params && Object.assign(d, r.params);
  r.query && Object.assign(d, r.query);
  r.body && Object.assign(d, r.body);
  return d;
};

const queryLocations = async () => {
  return await query({
    sql: `select l.id as locationId, l.name as locationName, l.capacity as locationCapacity, count(zl.location_id) as totalLocationZombies from location l
    left join zombie_location zl on zl.location_id = l.id and zl.is_in = true 
    group by l.id order by l.name ASC`,
  });
};

const getLocations = async (req, res) => {
  const r = await queryLocations();
  if (r) {
    res.json(r);
  } else {
    res.json([]);
  }
};

const getZombies = async (req, res) => {
  const r = await query({
    sql: 'select id, name from zombie',
  });
  if (r) {
    res.json(r);
  } else {
    res.json([]);
  }
};

const getZombiesLocation = async (req, res) => {
  const zombieLocations = await query({
    sql: `select zl.zombie_id, z.name as zombie_name, z.image as zombie_image, zl.location_id, l.name as location_name, zl.date from zombie_location zl
    INNER JOIN location l on zl.location_id = l.id
    INNER JOIN zombie z on zl.zombie_id = z.id
    where zl.is_in = true order by l.name ASC`,
  });
  const locations = await queryLocations();
  const assignedZombies = [];
  for (let i = 0; i < locations.length; i++) {
    if (!locations[i].zombies) {
      locations[i].zombies = [];
    }
    for (let j = 0; j < zombieLocations.length; j++) {
      if (
        zombieLocations[j].location_id === locations[i].locationId &&
        !assignedZombies.includes(zombieLocations[j].zombie_id)
      ) {
        assignedZombies.push(zombieLocations[j].zombie_id);

        const zombie = {
          zombieId: zombieLocations[j].zombie_id,
          zombieName: zombieLocations[j].zombie_name,
          zombieImage: zombieLocations[j].zombie_image,
        };

        locations[i].zombies.push(zombie);
      }
    }
  }
  if (locations) {
    res.json(locations);
  } else {
    res.json([]);
  }
};

const updateZombieLocation = async (req, res) => {
  const { zombieId, locationId } = getReqParams(req);

  if(zombieId && locationId){
    const clearLocation = await query({
      sql: `Update zombie_location set is_in = false where zombie_id = ?`,
      params: [zombieId],
    });
    if (clearLocation) {
      const r = await query({
        sql: `INSERT INTO zombie_location (location_id, zombie_id, date, is_in) VALUES (?, ?, ?, true)`,
        params: [locationId, zombieId, new Date().toISOString()],
      });
      if (r) {
        res.status(200);
        res.json([]);
      } else {
        res.status(400);
        res.json([]);
      }
    } else {
      res.status(400);
      res.json([]);
    }
  }else{
    res.status(400);
    res.json();
  }
};

module.exports = {
  getZombiesLocation,
  getLocations,
  getZombies,
  updateZombieLocation,
};
