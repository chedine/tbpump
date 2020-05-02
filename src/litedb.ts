import {
    Entity, Column, OneToMany, ManyToOne, Index,
    JoinColumn, JoinTable, PrimaryColumn, PrimaryGeneratedColumn
}
    from "typeorm";
import { createConnection, getManager, getConnection } from "typeorm";
const { Identity, Maybe, Either, Future, IO } = require("ramda-fantasy");
import * as R from "ramda";

@Entity()
@Index("index1", ["name", "trade_date"], { unique: true })
export class Instrument {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column("integer", { nullable: true })
    expiry?: number;

    @Column("double", { nullable: false })
    close: number;

    @Column("double", { nullable: false })
    open: number;

    @Column("double", { nullable: false })
    low: number;

    @Column("double", { nullable: false })
    high: number;

    @Column("integer", { nullable: true })
    oi: number;

    @Column("integer", { nullable: false })
    trade_date: number;

    @Column("text", { nullable: false })
    underlying: string;

    @Column("integer", { nullable: true })
    volume: number;

    @Column("double", { nullable: true })
    strike: number;

    @Column("tinyint", { nullable: false })
    type: number;

    @Column("text", { nullable: false })
    name: number;
}

const setup = R.curry((dropSchema: boolean, databaseLocation: string) =>
    Future((reject, resolve) => createConnection({
        type: "mariadb",
        database: "bhavcopy",
        username:"admin",
        password:"password",
        host:"127.0.0.1",
        entities: [
            Instrument
        ],
        dropSchema: dropSchema,
        // logging: ["error"],
        synchronize: true,
    }).then(_ => resolve("DB setup completed .."))
        .catch(reject)
    ));

export const dropAndCreate = setup(true);
export const init = setup(false);

const insertInstrument = (repo, instrument) =>
    Future((rej, res) =>
        // repo.save(instrument).then(res).catch(rej))
        getConnection().createQueryBuilder()
            .insert().into(Instrument).values(instrument)
            .execute()
            .then(res)
            .catch(rej));

export const bulkInsertInstruments = (db, instruments: Instrument[]) =>
    Future((reject, resolve) => {
        const repo = getManager().getRepository(Instrument);
        const inserts: any =
            R.traverse(Future.of, instrument => insertInstrument(repo, instrument), R.splitEvery(50, instruments));
        inserts.fork(
            r => reject(`Failed to insert : ${r}`),
            r => resolve(`Insert Completed for  ${r.length} records`));
        /** const ins = instruments.length > 1 ? instruments.slice(0,500): instruments;            
                getConnection().createQueryBuilder()
                    .insert().into(Instrument).values(ins)
                    .execute()
                    .then(resolve(`Insert Completed for  ${instruments.length} records`))
                    .catch(err => reject({
                        err: "Failed to Insert",
                        details: err,
                        recordLength: instruments.length
                    }))            **/
    })

export const mockBlukInsertInstruments = (db, instruments: Instrument[]) =>
    Future((rj, rs) => rs("Mock: Inserting " + instruments.length + " instruments !!"));

export const findLastRefresh = () =>
    Future((rej, res) =>
        getConnection().getRepository(Instrument)
            .query("select max(trade_date) as lastRefresh from instrument")
            .then(res)
            .catch(rej));