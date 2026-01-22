const DB = {
    _key: "DATABASE_SYSTEM",

    _getSystem() {
        return JSON.parse(localStorage.getItem(this._key)) || { databases: {} };
    },

    _saveSystem(system) {
        localStorage.setItem(this._key, JSON.stringify(system));
    },

    /* ---------- DATABASES ---------- */
    createDatabase(name) {
        const system = this._getSystem();
        if (system.databases[name]) return false;

        system.databases[name] = {
            users: [],
            attendance: [],
            housePoints: []
        };

        this._saveSystem(system);
        return true;
    },

    deleteDatabase(name) {
        const system = this._getSystem();
        if (!system.databases[name]) return false;

        delete system.databases[name];
        this._saveSystem(system);
        return true;
    },

    listDatabases() {
        return Object.keys(this._getSystem().databases);
    },

    /* ---------- USERS ---------- */
    addUser(dbName, user) {
        const system = this._getSystem();
        const db = system.databases[dbName];
        if (!db) return false;

        if (db.users.find(u => u.username === user.username)) return false;

        db.users.push(user);
        this._saveSystem(system);
        return true;
    },

    getUsers(dbName) {
        return this._getSystem().databases[dbName]?.users || [];
    },

    /* ---------- AUTH ---------- */
    login(dbName, username, password) {
        const db = this._getSystem().databases[dbName];
        if (!db) return null;

        return db.users.find(
            u => u.username === username && u.password === password
        ) || null;
    },

    /* ---------- ATTENDANCE ---------- */
    recordAttendance(dbName, record) {
        const system = this._getSystem();
        const db = system.databases[dbName];
        if (!db) return false;

        db.attendance.push(record);
        this._saveSystem(system);
        return true;
    },

    getAttendance(dbName) {
        return this._getSystem().databases[dbName]?.attendance || [];
    },

    /* ---------- HOUSE POINTS ---------- */
    addHousePoints(dbName, record) {
        const system = this._getSystem();
        const db = system.databases[dbName];
        if (!db) return false;

        db.housePoints.push(record);
        this._saveSystem(system);
        return true;
    },

    getHousePoints(dbName) {
        return this._getSystem().databases[dbName]?.housePoints || [];
    }
};