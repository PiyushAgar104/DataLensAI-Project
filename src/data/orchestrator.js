/**
 * AI MYDATA Visual -- Universal Activity & Event Simulator Orchestrator
 * Maps telemetry metrics and query streams to the Electric Violet & Quantum Cyan palette.
 */

export class DatabaseOrchestrator {
    constructor() {
        this.activeDb = 'oracle'; // currently selected database node
        this.burstMultiplier = 1;
        this.threatLevel = 0; // 0 to 100
        this.time = 0;

        // Custom metrics state
        this.metrics = {
            cpu: 37,
            ram: 58,
            latency: 0.8,
            cache: 99.8
        };

        // Query mock data pools for all database types
        this.queryTemplates = {
            oracle: [
                "SELECT * FROM USERS WHERE ID = 84920 /* AI OPTIMIZED */",
                "INSERT INTO ORDERS (ID, TOTAL) VALUES (9042, 420.50)",
                "UPDATE INVENTORIES SET STOCK = STOCK - 1 WHERE PROD_ID = 239",
                "ALTER INDEX ORDERS_IDX REBUILD PARALLEL",
                "[ORACLE-RAC] Global Cache Fusion synchronised Node-A to Node-B"
            ],
            postgres: [
                "SELECT * FROM users JOIN orders ON users.id = orders.user_id WHERE users.active = true",
                "BEGIN; INSERT INTO accounts (id, balance) VALUES (94, 25000); COMMIT;",
                "EXPLAIN ANALYZE SELECT count(*) FROM metrics WHERE ts > NOW() - INTERVAL '1 day'",
                "VACUUM FULL ANALYZE sessions",
                "CREATE INDEX idx_orders_created_at ON orders (created_at)"
            ],
            mysql: [
                "SELECT * FROM products LIMIT 10 OFFSET 200",
                "INSERT INTO logs (message, severity) VALUES ('Disk check passed', 'INFO')",
                "OPTIMIZE TABLE payments",
                "SHOW VARIABLES LIKE 'innodb_buffer_pool_size'",
                "SELECT * FROM users FORCE INDEX (idx_email) WHERE email = 'admin@sys.local'"
            ],
            sqlserver: [
                "SELECT TOP 5 * FROM system_configs WITH (NOLOCK)",
                "EXEC sp_executesql N'SELECT * FROM clients WHERE company_id = @1', N'@1 int', 45",
                "ALTER INDEX ALL ON transactions REORGANIZE",
                "BEGIN TRAN; UPDATE sales SET status = 'Shipped' WHERE id = 902; COMMIT TRAN;",
                "DBCC SHRINKDATABASE (db_historical)"
            ],
            mongodb: [
                "db.users.find({ active: true, age: { $gt: 21 } })",
                "db.orders.aggregate([{ $match: { status: 'PAID' } }, { $group: { _id: '$cat', total: { $sum: '$price' } } }])",
                "db.sessions.updateOne({ sid: 'sess_904' }, { $set: { lastActive: new Date() } })",
                "db.inventories.bulkWrite([ { insertOne: { document: { item: 'mat' } } } ])",
                "db.logs.deleteMany({ timestamp: { $lt: new Date(Date.now() - 86400000) } })"
            ],
            cassandra: [
                "SELECT * FROM user_profiles WHERE user_id = e2ba9d2e-0fa2-43fa USING CONSISTENCY LOCAL_QUORUM",
                "INSERT INTO product_catalog (sku, price, specs) VALUES ('SKU-940', 89.9, {...})",
                "UPDATE sessions SET active = false WHERE sess_id = 's-948' IF EXISTS",
                "BATCH; INSERT INTO logs (t, m) VALUES (...); APPLY BATCH;",
                "ALTER KEYSPACE my_cluster WITH replication = {'class': 'NetworkTopologyStrategy'}"
            ],
            neo4j: [
                "MATCH (u:User {id: 4892})-[r:PURCHASED]->(p:Product) RETURN p.name, r.timestamp",
                "MATCH (a:Person {name: 'Alice'}), (b:Person {name: 'Bob'}) CREATE (a)-[:FRIEND_OF {since: 2026}]->(b)",
                "MATCH (node) WHERE id(node) = 89042 SET node.weight = 8.5",
                "CREATE CONSTRAINT FOR (book:Book) REQUIRE book.isbn IS UNIQUE",
                "MATCH p=shortestPath((u1:User {id: 2})-[*..5]-(u2:User {id: 98})) RETURN p"
            ],
            dynamodb: [
                "GetItem { TableName: 'Users', Key: { 'UserId': { S: 'user_482' } } }",
                "PutItem { TableName: 'Orders', Item: { 'OrderId': { S: 'ord_90' }, 'Amount': { N: '249.5' } } }",
                "Query { TableName: 'Logs', KeyConditionExpression: 'AppId = :id AND ts > :t' }",
                "UpdateItem { TableName: 'Payments', Key: { 'PayId': { S: 'p_84' } }, UpdateExpression: 'SET val = :v' }",
                "BatchWriteItem { RequestItems: { 'Sessions': [...] } }"
            ],
            redis: [
                "GET session:token_9048281 (CACHE HIT)",
                "SETEX rate_limit:192.168.1.5 60 '1'",
                "PUBLISH event_bus 'order_completed_event'",
                "LPUSH transaction_queue '{\"id\": 98, \"val\": 120}'",
                "HGETALL user:profile:1004"
            ],
            firebase: [
                "[FIREBASE] Realtime listener triggered on path '/presence/users/904' -- STATE: ONLINE",
                "[FIREBASE] Write transaction on '/checkout/orders/ord_840' -- SUCCESS",
                "[FIREBASE] Realtime sync: Synced 12 nodes downstream to mobile-client (84ms)",
                "[FIREBASE] Cloud Firestore: GetDocument '/users/u_984' (Cache hit)",
                "[FIREBASE] Push Notification event queued successfully on '/notifications/queue'"
            ],
            supabase: [
                "[SUPABASE] Edge Function active: 'payment-webhook' resolved in 24ms",
                "[SUPABASE] Auth trigger: Sign-in complete for user 'developer@antigravity.ai'",
                "SELECT * FROM public.profiles WHERE id = auth.uid()",
                "[SUPABASE] Realtime replication: Broadcasted payload on public.orders -- 3 clients notified",
                "[SUPABASE] Storage: Downloaded avatar 'avatar_948.png' from bucket 'public-assets'"
            ],
            pinecone: [
                "Query { vector: [0.15, -0.42, 0.88, ...], topK: 10, includeMetadata: true } (Similarity: 98.4%)",
                "Upsert { vectors: [ { id: 'embedding_u904', values: [...] } ] } in namespace 'user-contexts'",
                "DescribeIndexStats { IndexName: 'global-embeddings' } -- active vectors: 1,245,800",
                "Delete { ids: ['emb_8942'] }",
                "Query { filter: { category: 'financial' }, topK: 5 } (Similarity match complete in 1.8ms)"
            ],
            weaviate: [
                "Get { Things { Article (nearVector: { vector: [...] }, certainty: 0.92) { title, summary } } }",
                "BatchImport: Imported 120 semantic documents into Class 'KnowledgeBase'",
                "Explore { Concepts: ['quantum computing', 'database sharding'] } -- MATCH FOUND",
                "Get { Things { EmbeddingStore (where: { path: ['author'], operator: Equal, valueString: 'AI' }) } }",
                "[WEAVIATE] Auto-Schema updated: Added vector embedding relation 'author_vector' (12ms)"
            ],
            elasticsearch: [
                "GET /logs_index/_search { query: { match: { message: 'exception' } } }",
                "POST /metrics_index/_bulk { index: { _id: 1 } } { cpu: 45, timestamp: ... }",
                "GET /products_index/_search { aggs: { popular_brands: { terms: { field: 'brand' } } } }",
                "PUT /indexes/configs { settings: { number_of_shards: 3, number_of_replicas: 1 } }",
                "DELETE /sessions_index/_query { query: { range: { ts: { lt: 'now-7d' } } } }"
            ],
            snowflake: [
                "COPY INTO @s3_datalake_stage/orders FROM my_warehouse_db.public.orders_table",
                "SELECT SUM(sales), category FROM datalake.analytics.daily_summaries GROUP BY 2",
                "ALTER WAREHOUSE WH_COMPUTE RESIZE = 'XLARGE' (Autonomous scaling active)",
                "CREATE OR REPLACE STAGE temp_s3_stage URL = 's3://datalake-buckets/raw/'",
                "SELECT * FROM logs_table SYSTEM$CLUSTERING_INFORMATION('idx_ts')"
            ],
            bigquery: [
                "SELECT count(*), device_os FROM `project.analytics.user_clicks` WHERE date = CURRENT_DATE() GROUP BY 2",
                "LOAD DATA OVERWRITE `project.raw.logs` FROM FILES ( uris=['gs://datalake/raw/*.json'], format='JSON' )",
                "CREATE OR REPLACE MODEL `project.ml.capacity_forecast` OPTIONS(model_type='ARIMA_PLUS') AS ...",
                "SELECT * FROM `project.enterprise.billing` LIMIT 1000 -- dryRun billed 420 GB bytes processed",
                "EXPORT DATA OPTIONS(uri='gs://bq-export/data_*.csv') AS SELECT * FROM reporting_table"
            ],
            s3: [
                "[AWS-S3] PUT Object 'datalake/raw/transactions_2026-05-28.parquet' - SIZE: 242.4 MB (48ms)",
                "[AWS-S3] GET Object 'models/query-optimiser-weights.bin' - CACHE HIT",
                "[AWS-S3] LifeCycle policy executed: Moved 12,400 expired files to Glacier Deep Archive",
                "[AWS-S3] Multipart Upload completed: Segment_45 of object 'backup.tar.gz' uploaded successfully",
                "[AWS-S3] Bucket Replication active: Synced object to replica bucket 'us-west-2' (Latency: 12ms)"
            ]
        };

        this.aiDiagnostics = {
            relational: [
                "Slow SELECT query detected on relational cluster. Composite index recommended.",
                "Autopilot optimized transaction logging pipelines. Latency index dropped successfully.",
                "Primary DB replication synchronized with 0.1ms network delay.",
                "SQL transaction deadlock resolved autonomously by releasing thread lock."
            ],
            nosql: [
                "Heavy write ingestion spike on document shard sets. Balancer active.",
                "Graph Hop database path traversal consolidated. Latency decreased.",
                "WiredTiger cache swept. Deleted documents garbage collected.",
                "Document sharding boundaries successfully balanced across replica instances."
            ],
            realtime: [
                "Websocket channel capacity scaled to accommodate heavy client sockets.",
                "LRU Cache memory thresholds reached maximum limits. Flushed cache tables.",
                "Active pub/sub event pipeline buffers consolidated. Ingestion stabilized.",
                "Cache sync sync rates checked. Caching channels performing nominally."
            ],
            vector: [
                "High-dimensional semantic query scan identified. Scaled Pinecone cluster replicas.",
                "Vector similarity clustering sweep completed. Mapping LLM thought pathways.",
                "Weaviate schema optimized. Multi-class embedding vectors consolidated."
            ],
            warehouse: [
                "Auto-scaling virtual cloud warehouse resized successfully to process daily jobs.",
                "BigQuery bill optimization dry-run dry query resolved. Storage partition mapped.",
                "Multipart datalake upload backup staging completed successfully."
            ]
        };
    }

    setActiveDatabase(dbName) {
        this.activeDb = dbName;
    }

    setBurstMultiplier(val) {
        this.burstMultiplier = Math.max(1, Math.min(5, val));
    }

    setThreatLevel(val) {
        this.threatLevel = val;
    }

    tick(deltaTime) {
        this.time += deltaTime;

        const burstFactor = this.burstMultiplier > 1 ? 1.35 + (this.burstMultiplier * 0.15) : 1;
        
        this.metrics.cpu = Math.min(99, Math.max(12, Math.round(
            37 + Math.sin(this.time * 0.6) * 6 + Math.cos(this.time * 1.8) * 3 + (this.burstMultiplier - 1) * 8 + (this.threatLevel > 0 ? 15 : 0)
        )));

        this.metrics.ram = Math.min(99, Math.max(25, Math.round(
            58 + Math.sin(this.time * 0.15) * 2 + Math.cos(this.time * 0.9) * 1.2 + (this.burstMultiplier - 1) * 4 + (this.threatLevel > 0 ? 5 : 0)
        )));

        this.metrics.latency = parseFloat(Math.max(0.1, (
            0.8 + Math.sin(this.time * 0.9) * 0.12 + (this.burstMultiplier - 1) * 0.15 + (this.threatLevel > 0 ? 0.4 : 0) + Math.random() * 0.05
        )).toFixed(1));

        this.metrics.cache = parseFloat((
            99.8 + Math.sin(this.time * 0.03) * 0.04 - (this.burstMultiplier - 1) * 0.05 - (this.threatLevel > 0 ? 0.1 : 0) + Math.random() * 0.01
        ).toFixed(2));

        return this.metrics;
    }

    generateEvents() {
        const eventsCount = Math.round((8 * (0.6 + Math.random() * 0.8)) * (this.burstMultiplier * 0.8));
        const eventsList = [];

        if (this.threatLevel > 0 && Math.random() < 0.35) {
            eventsList.push(this.createThreatAnomalyEvent());
        }

        for (let i = 0; i < eventsCount; i++) {
            eventsList.push(this.createSingleEvent());
        }

        return eventsList;
    }

    createSingleEvent() {
        const rand = Math.random();
        let type, message, speed, intensity;

        // Color Palette Map:
        // 1. AI Real-time Activity (Electric Violet) -> 'violet' (rand < 0.25)
        // 2. Streaming Events (Quantum Cyan) -> 'cyan' (0.25 <= rand < 0.45)
        // 3. Network Data Traffic (Emerald Green) -> 'emerald' (0.45 <= rand < 0.85)
        // 4. Live Connection Sync (Amber Orange) -> 'amber' (rand >= 0.85)

        if (rand < 0.25) {
            type = 'violet';
            speed = 4.2 + Math.random() * 2.2;
            intensity = 0.95;
            const models = ['QueryOptim-Neural', 'VectorMatcher-v3', 'SelfHealer-RL'];
            message = `[AI OS] Optimized query pathway dynamically using active ${models[Math.floor(Math.random() * models.length)]} model.`;
        } 
        else if (rand < 0.45) {
            type = 'cyan';
            speed = 1.4 + Math.random() * 0.8;
            intensity = 0.6;
            message = `[EVENT INGEST] Wrote transaction block batch into decentralized oplog replica storage.`;
        } 
        else if (rand < 0.85) {
            type = 'emerald';
            speed = 2.4 + Math.random() * 1.5;
            intensity = 0.75;
            const queryPool = this.queryTemplates[this.activeDb] || this.queryTemplates['oracle'];
            message = `[TRAFFIC EXEC] ${queryPool[Math.floor(Math.random() * queryPool.length)]}`;
        } 
        else {
            type = 'amber';
            speed = 1.6 + Math.random() * 0.8;
            intensity = 0.5;
            message = `[SYNC STATUS] Multi-cloud cluster synchronization complete. Secondary replica sets synced (latency 0.2ms).`;
        }

        return {
            type,
            message,
            speed,
            intensity,
            nodeIndex: Math.floor(Math.random() * 32)
        };
    }

    createThreatAnomalyEvent() {
        const threatMessages = [
            `[INFRARED ANOMALY] SECURITY THREAT: Detected rapid SQL injection pattern block on database port!`,
            `[INFRARED ANOMALY] VECTOR THREAT: High-density anomaly clustering detected on namespace 'embeddings'. Quarantined.`,
            `[INFRARED ANOMALY] SYSTEM EXFILTRATION: Unauthorized connection credential brute force attempt blocked.`,
            `[INFRARED ANOMALY] CRITICAL MISMATCH: Regional replication key mismatch sector-4. Triggered self-repair.`,
        ];

        return {
            type: 'coral',
            message: threatMessages[Math.floor(Math.random() * threatMessages.length)],
            speed: 5.2,
            intensity: 1.0,
            nodeIndex: Math.floor(Math.random() * 32)
        };
    }

    getAiDiagnosis(category) {
        const pool = this.aiDiagnostics[category] || this.aiDiagnostics['relational'];
        return pool[Math.floor(Math.random() * pool.length)];
    }
}
