import request from 'supertest';
import app from '../src/app'; 

describe('Category API Endpoints', () => {
  it('should return all categories', async () => {
    const res = await request(app).get('/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a new category', async () => {
    const res = await request(app)
      .post('/categories')
      .send({ name: 'TestCategory' })
      .set('Accept', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name', 'TestCategory');
  });
});
