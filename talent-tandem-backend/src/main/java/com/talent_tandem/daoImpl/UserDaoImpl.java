package com.talent_tandem.daoImpl;
import com.talent_tandem.dao.*;
import com.talent_tandem.model.*;
import com.talent_tandem.repository.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class UserDaoImpl  implements IUserDao {

    private final IUserRepo repo;

    public UserDaoImpl(IUserRepo repo) {
        this.repo = repo;
    }

    @Override
    public User createUser(User user) {
        return repo.save(user);
    }

    @Override
    public User findByUsername(String username) {
        return repo.findByUsername(username).orElse(null);
    }
    
    @Override
    public User findByEmail(String email) {
        return repo.findByEmail(email);
    }
    
    @Override
    public User updateUser(User user) {
        return repo.save(user);
    }

    @Override
    public Optional<User> findById(Long userId) {
        return  repo.findById(userId);
    }

    @Override
    public User save(User user) {
        return repo.save(user);
    }

    @Override
    public List<User> findAll() {
        return repo.findAll();
    }
}
